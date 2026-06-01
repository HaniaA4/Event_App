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


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)


