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
import os
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, initialize_database, User, Category, Event, Registration, Comment


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


@app.route("/") 
def home():
    return render_template("index.html")


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
    
    return render_template(
        "profile.html",
        organized_events=organized_events,
        my_registrations=my_registrations,
    )


@app.route("/events")
def events():
    all_events = Event.select()
    return render_template("events.html", events=all_events)


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
    current_user = get_current_user()
    if current_user:
        existing = Registration.get_or_none(
            (Registration.user == current_user) &
            (Registration.event == event)
        )
        is_registered = existing is not None
        
    comments = list(event.comments)

    return render_template(
        "event_details.html",
        event=event,
        registrations_count=registrations_count,
        spots_left=spots_left,
        is_registered=is_registered,
        comments=comments,
    )


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


@app.route("/make-admin/<email>") 
def make_admin(email): # temporary bootstrap route
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
    return render_template("admin.html")


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
    
