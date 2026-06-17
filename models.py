from peewee import *

db = SqliteDatabase("app.db")

class BaseModel(Model):
    class Meta:
        database = db
        # Base model that all models will receive from.
        # Sets the database used for all models.

class User(BaseModel):
    email = CharField(unique=True)
    full_name = CharField()
    password_hash = CharField()
    is_admin = BooleanField(default=False)

    #stores email, full name, password hash and if it is admin or not.
    # the email is unique, no two users can have the same


class Category(BaseModel):
    name = CharField(unique=True)

    #stores the name of the category


class Event(BaseModel):
    title = CharField()
    description = TextField(null=True)
    date = DateTimeField()
    location = CharField()
    status = CharField(default="open")
    max_participants = IntegerField(null=True)
    map_link = CharField(null=True)
    category = ForeignKeyField(Category, backref="events")
    organizer = ForeignKeyField(User, backref="events")
    
    # Number of participants is not stored here, it will be counted from registrations: event.registrations.count().
    # stores the title, description, date, location, status, max participants, map link, category and organizer of the event.


class Registration(BaseModel):
    user = ForeignKeyField(User, backref="registrations")
    event = ForeignKeyField(Event, backref="registrations")

    # A user can registrate to an event only once



class Favorite(BaseModel):
    user = ForeignKeyField(User, backref="favorites")
    event = ForeignKeyField(Event, backref="favorites")

    class Meta:
        indexes = ((('user', 'event'), True),)

        # A user can favorite an event only once

class Comment(BaseModel):
    text = TextField()
    event = ForeignKeyField(Event, backref="comments")
    author = ForeignKeyField(User, backref="comments")

    #Users are able to comment on events and the text, author and event are stored in the database.


def initialize_database():
    db.connect(reuse_if_open=True)
    db.create_tables([User, Category, Event, Registration, Favorite, Comment], safe=True)

    default_categories = [
        "Study Sessions",
        "Workshops",
        "Sports",
        "Cultural",
        "Talks",
        "Group Meetings"
    ]

    # Create default categories if they don't exist


    for name in default_categories:
        Category.get_or_create(name=name)

        # Creates tables with categories if they don't exist and adds them to the database
    db.close()
