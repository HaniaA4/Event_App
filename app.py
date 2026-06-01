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


@app.route("/") 
def home():
    return render_template("index.html") # Example
    

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        errors = []
        
        if not username:
            errors.append("Username is required.")
            
        if len(username) > 30:
            errors.append("Username is too long.")
            
        if len(password) < 8:
            errors.append("Password must have at least 8 characters.")
            
        if User.get_or_none(User.username == username):
            errors.append("Username already exists.")

        if errors:
            for error in errors:
                flash(error, "error")
            return redirect(url_for("register"))

        password_hash = generate_password_hash(password)

        User.create(username=username, password_hash=password_hash)

        flash("Account created successfully. You can now log in.", "success")
        return redirect(url_for("login"))

    return render_template("register.html")


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)


