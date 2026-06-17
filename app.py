from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session,
    abort
)

from functools import wraps
from datetime import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash
from peewee import prefetch
from models import db, initialize_database, User, Category, Event, Registration, Comment, Favorite


app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key")


@app.before_request
def before_request():
    if db.is_closed():
        db.connect()


@app.after_request
def after_request(response):
    if not db.is_closed():
        db.close()
    return response


def get_current_user():
    user_id = session.get("user_id")
    if user_id is None:
        return None
    return User.get_or_none(User.id == user_id)


def login_required(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        if get_current_user() is None:
            flash("You must log in first.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return wrapped


def admin_required(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        current_user = get_current_user()
        if current_user is None:
            flash("You must log in first.", "warning")
            return redirect(url_for("login"))
        if not current_user.is_admin:
            abort(403)
        return f(*args, **kwargs)
    return wrapped


@app.context_processor
def inject_current_user():
    return {"current_user": get_current_user()}


def render_admin_dashboard(editing_event=None):
    return render_template(
        "admin.html",
        categories=list(Category.select().order_by(Category.name)),
        events=list(
            prefetch(
                Event.select().order_by(Event.date.desc()),
                Registration.select(),
                User.select(),
            )
        ),
        users=list(User.select().order_by(User.full_name)),
        comments=list(Comment.select().order_by(Comment.id.desc())),
        editing_event=editing_event,
    )


def parse_admin_event_form():
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip() or None
    date_value = request.form.get("date", "").strip()
    location = request.form.get("location", "").strip()
    status = request.form.get("status", "open").strip()
    max_participants_value = request.form.get("max_participants", "").strip()
    map_link = request.form.get("map_link", "").strip() or None
    category_id = request.form.get("category_id", "").strip()
    organizer_id = request.form.get("organizer_id", "").strip()

    errors = []

    if not title:
        errors.append("Event title is required.")
    if not date_value:
        errors.append("Event date is required.")
    if not location:
        errors.append("Event location is required.")
    if status not in {"open", "closed"}:
        errors.append("Event status must be open or closed.")

    event_date = None
    if date_value:
        try:
            event_date = datetime.fromisoformat(date_value)
        except ValueError:
            errors.append("Event date must be a valid date and time.")

    max_participants = None
    if max_participants_value:
        try:
            max_participants = int(max_participants_value)
            if max_participants < 1:
                errors.append("Maximum participants must be at least 1.")
        except ValueError:
            errors.append("Maximum participants must be a number.")

        #add a maximum number of participants if the option is chosen

    category = Category.get_or_none(Category.id == category_id) if category_id else None
    if category_id and category is None:
        errors.append("Selected category does not exist.")
    if not category_id:
        errors.append("Select a category for the event.")
        #Mandatory selection of a category

    organizer = User.get_or_none(User.id == organizer_id) if organizer_id else None
    if organizer_id and organizer is None:
        errors.append("Selected organizer does not exist.")
    if not organizer_id:
        errors.append("Select an organizer for the event.")
    # Mandatory selection of an organizer

    return {
        "errors": errors,
        "title": title,
        "description": description,
        "date": event_date,
        "location": location,
        "status": status,
        "max_participants": max_participants,
        "map_link": map_link,
        "category": category,
        "organizer": organizer,
    }


def parse_admin_category_name():
    return request.form.get("name", "").strip()


def parse_admin_registration_form():
    user_id = request.form.get("user_id", "").strip()
    user = User.get_or_none(User.id == user_id) if user_id else None

    errors = []
    if not user_id:
        errors.append("Select a participant.")
    elif user is None:
        errors.append("Selected participant does not exist.")

    return {"errors": errors, "user": user}


def get_user_favorite_event_ids(user):
    if user is None:
        return set()
    # get favorite events
    return {
        favorite.event_id
        for favorite in Favorite.select(Favorite.event).where(Favorite.user == user)
    }


@app.route("/") 
def home():
    events = list(Event.select())
    profiles = list(User.select())
    categories = list(Category.select())

    return render_template(
        "index.html",
        events=events,
        profiles=profiles,
        categories=categories
    )

@app.route("/login", methods=["GET", "POST"])
def login():
    # If already logged in, no need to see the login page 
    if get_current_user():
        return redirect(url_for("home"))
        
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        user = User.get_or_none(User.email == email)

        if user and check_password_hash(user.password_hash, password):
            session["user_id"] = user.id
            flash("Login successful.", "success")
            return redirect(url_for("home"))
            
        flash("Invalid email or password.", "error")
        return redirect(url_for("login"))

    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if get_current_user():
        return redirect(url_for("home"))
    
    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm_password", "")

        errors = []
        
        if not full_name:
            errors.append("Full name is required.")
            
        if len(full_name) > 100:
            errors.append("Full name is too long.")
            
        if not email:
            errors.append("Email is required.")
        elif "@" not in email:
            errors.append("Please enter a valid email address.")
            
        if len(password) < 8:
            errors.append("Password must have at least 8 characters.")

        if password != confirm:
            errors.append("Passwords do not match.")

        if email and User.get_or_none(User.email == email):
            errors.append("An account with this email already exists.")     

        if errors:
            for error in errors:
                flash(error, "error")
            return redirect(url_for("login"))

        password_hash = generate_password_hash(password)

        User.create(full_name=full_name, email=email, password_hash=password_hash)

        flash("Account created successfully. You can now log in.", "success")
        return redirect(url_for("login"))

    return redirect(url_for("login"))


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "success")
    return redirect(url_for("login"))


@app.route("/profile")
@login_required
def profile():
    current_user = get_current_user()
    
    organized_events = list(
        Event.select().where(Event.organizer == current_user)
    )
    
    my_registrations = list(
        Registration.select().where(Registration.user == current_user)
    )

    my_favorites = list(
        Event.select()
        .join(Favorite)
        .where(Favorite.user == current_user)
        .order_by(Event.date)
    )
    
    return render_template(
        "profile.html",
        organized_events=organized_events,
        my_registrations=my_registrations,
        my_favorites=my_favorites,
    )


@app.route("/events")
def events():
    all_events = Event.select()
    favorite_event_ids = get_user_favorite_event_ids(get_current_user())
    return render_template(
        "events.html",
        events=all_events,
        favorite_event_ids=favorite_event_ids,
    )

@app.route("/events/create", methods=["GET", "POST"])
@login_required
def create_event():
    categories = Category.select()

    if request.method == "POST":
        current_user = get_current_user()

        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        date_value = request.form.get("date", "").strip()
        location = request.form.get("location", "").strip()
        max_participants = request.form.get("max_participants", "")
        category_id = request.form.get("category_id")

        try:    
            event_date = datetime.fromisoformat(date_value)
        except ValueError:
            flash("Please enter a valid date and time.", "error")
            return   redirect(url_for("create_event"))    

        if not title or not date_value or not location or not category_id:
            flash("Please fill in all required fields.", "error")
            return redirect(url_for("create_event"))

        category = Category.get_or_none(Category.id == category_id)

        Event.create(
            title=title,
            description=description,
            date=event_date,
            location=location,
            max_participants=int(max_participants) if max_participants else None,
            category=category,
            organizer=current_user
        )

        flash("Event created successfully.", "success")
        return redirect(url_for("events"))

    return render_template("create_event.html", categories=categories)

@app.route("/event/<int:event_id>")
def event_detail(event_id):
    event = Event.get_or_none(Event.id == event_id)
    if event is None:
        abort(404)
    registrations_count = event.registrations.count()
    
    spots_left = None
    if event.max_participants is not None:
        spots_left = event.max_participants - registrations_count
        
    is_registered = False
    is_favorite = False
    current_user = get_current_user()
    if current_user:
        existing = Registration.get_or_none(
            (Registration.user == current_user) &
            (Registration.event == event)
        )
        is_registered = existing is not None

        favorite = Favorite.get_or_none(
            (Favorite.user == current_user) &
            (Favorite.event == event)
        )
        is_favorite = favorite is not None
        
    comments = list(event.comments)

    return render_template(
        "event_details.html",
        event=event,
        registrations_count=registrations_count,
        spots_left=spots_left,
        is_registered=is_registered,
        is_favorite=is_favorite,
        comments=comments,
    )


@app.route("/event/<int:event_id>/favorite", methods=["POST"])
@login_required
def add_favorite(event_id):
    current_user = get_current_user()

    event = Event.get_or_none(Event.id == event_id)
    if event is None:
        abort(404)

    existing = Favorite.get_or_none(
        (Favorite.user == current_user) &
        (Favorite.event == event)
    )
    if existing is not None:
        flash("This event is already in your favorites.", "warning")
        return redirect(url_for("event_detail", event_id=event.id))

    Favorite.create(user=current_user, event=event)
    flash("Event added to favorites.", "success")
    return redirect(url_for("event_detail", event_id=event.id))


@app.route("/event/<int:event_id>/unfavorite", methods=["POST"])
@login_required
def remove_favorite(event_id):
    current_user = get_current_user()

    event = Event.get_or_none(Event.id == event_id)
    if event is None:
        abort(404)

    favorite = Favorite.get_or_none(
        (Favorite.user == current_user) &
        (Favorite.event == event)
    )
    if favorite is None:
        flash("This event is not in your favorites.", "warning")
        return redirect(url_for("event_detail", event_id=event.id))

    favorite.delete_instance()
    flash("Event removed from favorites.", "success")
    return redirect(url_for("event_detail", event_id=event.id))


@app.route("/event/<int:event_id>/register", methods=["POST"])
@login_required
def register_in_event(event_id):
    current_user = get_current_user()

    event = Event.get_or_none(Event.id == event_id)
    if event is None:
        abort(404)
        
    if event.status != "open":
        flash("This event is closed for registrations.", "error")
        return redirect(url_for("event_detail", event_id=event.id))
    
    existing = Registration.get_or_none(
        (Registration.user == current_user) &
        (Registration.event == event)
    )
    if existing is not None:
        flash("You are already registered in this event.", "warning")
        return redirect(url_for("event_detail", event_id=event.id))

    if event.max_participants is not None:
        if event.registrations.count() >= event.max_participants:
            flash("This event is full.", "error")
            return redirect(url_for("event_detail", event_id=event.id))
            
    Registration.create(user=current_user, event=event)
    flash("You are now registered in this event.", "success")
    return redirect(url_for("event_detail", event_id=event.id))

@app.route("/event/<int:event_id>/edit", methods=["GET", "POST"])
@login_required
def edit_event(event_id):
    current_user = get_current_user()
    event = Event.get_or_none(Event.id == event_id)

    if event is None:
        abort(404)

    if event.organizer != current_user:
        abort(403)

    categories = Category.select()

    if request.method == "POST":
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        date = request.form.get("date", "").strip()
        location = request.form.get("location", "").strip()
        max_participants = request.form.get("max_participants", "").strip()
        category_id = request.form.get("category_id")

        if not title or not date or not location or not category_id:
            flash("Please fill in all required fields.", "error")
            return redirect(url_for("edit_event", event_id=event.id))

        try:
            event_date = datetime.fromisoformat(date)
        except ValueError:
            flash("Please enter a valid date and time.", "error")
            return redirect(url_for("edit_event", event_id=event.id))

        category = Category.get_or_none(Category.id == category_id)
        if category is None:
            flash("Selected category does not exist.", "error")
            return redirect(url_for("edit_event", event_id=event.id))

        max_value = None
        if max_participants:
            try:
                max_value = int(max_participants)
                if max_value < 1:
                    flash("Maximum participants must be at least 1.", "error")
                    return redirect(url_for("edit_event", event_id=event.id))
            except ValueError:
                flash("Maximum participants must be a number.", "error")
                return redirect(url_for("edit_event", event_id=event.id))

        event.title = title
        event.description = description or None
        event.date = event_date
        event.location = location
        event.max_participants = max_value
        event.category = category
        event.save()

        flash("Event updated successfully.", "success")
        return redirect(url_for("event_detail", event_id=event.id))

    return render_template(
        "edit_event.html",
        event=event,
        categories=categories
    )


@app.route("/event/<int:event_id>/delete", methods=["POST"])
@login_required
def delete_event(event_id):
    current_user = get_current_user()
    event = Event.get_or_none(Event.id == event_id)

    if event is None:
        abort(404)

    if event.organizer != current_user:
        abort(403)

    Registration.delete().where(Registration.event == event).execute()
    Favorite.delete().where(Favorite.event == event).execute()
    Comment.delete().where(Comment.event == event).execute()

    event.delete_instance()

    flash("Event deleted successfully.", "success")
    return redirect(url_for("profile"))

@app.route("/event/<int:event_id>/cancel", methods=["POST"])
@login_required
def cancel_registration(event_id):
    current_user = get_current_user()

    event = Event.get_or_none(Event.id == event_id)
    if event is None:
        abort(404)
        
    registration = Registration.get_or_none(
        (Registration.user == current_user) &
        (Registration.event == event)
    )
    if registration is None:
        flash("You are not registered in this event.", "warning")
        return redirect(url_for("event_detail", event_id=event.id))

    registration.delete_instance()
    flash("Your registration was cancelled.", "success")
    return redirect(url_for("event_detail", event_id=event.id))


@app.route("/event/<int:event_id>/comments/add", methods=["POST"])
@login_required
def add_comment(event_id):
    current_user = get_current_user()
    
    event = Event.get_or_none(Event.id == event_id)
    if event is None:
        abort(404)
        
    text = request.form.get("text", "").strip()
    if not text:
        flash("Comment cannot be empty.", "error")
        return redirect(url_for("event_detail", event_id=event.id))

    Comment.create(text=text, event=event, author=current_user)
    flash("Comment added.", "success")
    return redirect(url_for("event_detail", event_id=event.id))

@app.route("/comments/<int:comment_id>/delete", methods=["POST"])
@login_required
def delete_comment(comment_id):
    current_user = get_current_user()

    comment = Comment.get_or_none(Comment.id == comment_id)
    if comment is None:
        abort(404)

    if comment.author != current_user and not current_user.is_admin:
        abort(403)

    event_id = comment.event.id
    comment.delete_instance()

    flash("Comment deleted.", "success")
    if current_user.is_admin:
        return redirect(url_for("admin"))   
    
    return redirect(url_for("event_detail", event_id=event_id))


@app.route("/make-admin/<email>") 
def make_admin(email):
    if User.get_or_none(User.is_admin == True) is not None:
        abort(403)
        
    user = User.get_or_none(User.email == email)
    if user is None:
        return "User not found"

    user.is_admin = True
    user.save()
    flash(f"{user.email} is now an admin.", "success")
    return redirect(url_for("home"))
    

@app.route("/admin")
@admin_required
def admin():
    return render_admin_dashboard()


@app.route("/admin/events/create", methods=["POST"])
@admin_required
def admin_create_event():
    form = parse_admin_event_form()
    if form["errors"]:
        for error in form["errors"]:
            flash(error, "error")
        return redirect(url_for("admin"))

    Event.create(
        title=form["title"],
        description=form["description"],
        date=form["date"],
        location=form["location"],
        status=form["status"],
        max_participants=form["max_participants"],
        map_link=form["map_link"],
        category=form["category"],
        organizer=form["organizer"],
    )

    flash("Event created successfully.", "success")
    return redirect(url_for("admin"))


@app.route("/admin/events/<int:event_id>/edit", methods=["GET", "POST"])
@admin_required
def admin_edit_event(event_id):
    event = Event.get_or_none(Event.id == event_id)
    if event is None:
        abort(404)

    if request.method == "POST":
        form = parse_admin_event_form()
        if form["errors"]:
            for error in form["errors"]:
                flash(error, "error")
            return redirect(url_for("admin_edit_event", event_id=event.id))

        event.title = form["title"]
        event.description = form["description"]
        event.date = form["date"]
        event.location = form["location"]
        event.status = form["status"]
        event.max_participants = form["max_participants"]
        event.map_link = form["map_link"]
        event.category = form["category"]
        event.organizer = form["organizer"]
        event.save()

        flash("Event updated successfully.", "success")
        return redirect(url_for("admin"))

    return render_admin_dashboard(editing_event=event)


@app.route("/admin/events/<int:event_id>/delete", methods=["POST"])
@admin_required
def admin_delete_event(event_id):
    event = Event.get_or_none(Event.id == event_id)
    if event is None:
        abort(404)

    Registration.delete().where(Registration.event == event).execute()
    Favorite.delete().where(Favorite.event == event).execute()
    Comment.delete().where(Comment.event == event).execute()
    event.delete_instance()

    flash("Event deleted successfully.", "success")
    return redirect(url_for("admin"))


@app.route("/admin/events/<int:event_id>/registrations/<int:registration_id>/edit", methods=["POST"])
@admin_required
def admin_edit_registration(event_id, registration_id):
    event = Event.get_or_none(Event.id == event_id)
    if event is None:
        abort(404)

    registration = Registration.get_or_none(
        (Registration.id == registration_id) &
        (Registration.event == event)
    )
    if registration is None:
        abort(404)

    form = parse_admin_registration_form()
    if form["errors"]:
        for error in form["errors"]:
            flash(error, "error")
        return redirect(url_for("admin"))

    if Registration.get_or_none(
        (Registration.event == event) &
        (Registration.user == form["user"]) &
        (Registration.id != registration.id)
    ) is not None:
        flash("That participant is already registered for this event.", "error")
        return redirect(url_for("admin"))

    registration.user = form["user"]
    registration.save()

    flash("Participant updated successfully.", "success")
    return redirect(url_for("admin"))


@app.route("/admin/events/<int:event_id>/registrations/<int:registration_id>/delete", methods=["POST"])
@admin_required
def admin_delete_registration(event_id, registration_id):
    event = Event.get_or_none(Event.id == event_id)
    if event is None:
        abort(404)

    registration = Registration.get_or_none(
        (Registration.id == registration_id) &
        (Registration.event == event)
    )
    if registration is None:
        abort(404)

    registration.delete_instance()

    flash("Participant removed from the event.", "success")
    return redirect(url_for("admin"))


@app.route("/admin/categories/create", methods=["POST"])
@admin_required
def admin_create_category():
    name = parse_admin_category_name()
    if not name:
        flash("Category name is required.", "error")
        return redirect(url_for("admin"))

    if Category.get_or_none(Category.name == name) is not None:
        flash("That category already exists.", "error")
        return redirect(url_for("admin"))

    Category.create(name=name)
    flash("Category created successfully.", "success")
    return redirect(url_for("admin"))


@app.route("/admin/categories/<int:category_id>/edit", methods=["POST"])
@admin_required
def admin_edit_category(category_id):
    category = Category.get_or_none(Category.id == category_id)
    if category is None:
        abort(404)

    name = parse_admin_category_name()
    if not name:
        flash("Category name is required.", "error")
        return redirect(url_for("admin"))

    duplicate = Category.get_or_none((Category.name == name) & (Category.id != category.id))
    if duplicate is not None:
        flash("That category already exists.", "error")
        return redirect(url_for("admin"))

    category.name = name
    category.save()
    flash("Category updated successfully.", "success")
    return redirect(url_for("admin"))


@app.route("/admin/categories/<int:category_id>/delete", methods=["POST"])
@admin_required
def admin_delete_category(category_id):
    category = Category.get_or_none(Category.id == category_id)
    if category is None:
        abort(404)

    if category.events.count() > 0:
        flash("You must reassign or delete the events in this category first.", "error")
        return redirect(url_for("admin"))

    category.delete_instance()
    flash("Category deleted successfully.", "success")
    return redirect(url_for("admin"))


@app.errorhandler(403)
def forbidden(error):
    return render_template("403.html"), 403

@app.errorhandler(404)
def not_found(error):
    return render_template("404.html"), 404

@app.errorhandler(500)
def internal_server_error(error):
    return render_template("500.html"), 500


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)
