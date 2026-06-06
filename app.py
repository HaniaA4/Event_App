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

from werkzeug.security import generate_password_hash, check_password_hash

from models import db, initialize_database, User, Category, Event, Registration


app = Flask(__name__)
app.secret_key = "dev-secret-key"


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

    return redirect(url_for(("login"))

@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "success")
    return redirect(url_for("login"))


@app.route("/profile)
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


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)
    
