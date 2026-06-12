from peewee import *

db = SqliteDatabase("app.db")

class BaseModel(Model):
    class Meta:
        database = db

class User(BaseModel):
    email = CharField(unique=True)
    full_name = CharField()
    password_hash = CharField()
    is_admin = BooleanField(default=False)


class Category(BaseModel):
    name = CharField(unique=True)


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


class Registration(BaseModel):
    user = ForeignKeyField(User, backref="registrations")
    event = ForeignKeyField(Event, backref="registrations")

class Comment(BaseModel):
    text = TextField()
    event = ForeignKeyField(Event, backref="comments")
    author = ForeignKeyField(User, backref="comments")


def initialize_database():
    db.connect()
    db.create_tables([User, Category, Event, Registration, Comment])
    db.close()
