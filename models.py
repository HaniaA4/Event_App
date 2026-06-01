from peewee import *

db = SqliteDatabase("app.db")

class BaseModel(Model):
    class Meta:
        database = db

class User(BaseModel):
    username = CharField(unique=True)
    password_hash = CharField()
    is_admin = BooleanField(default=False)


class Category(BaseModel):
    name = CharField(unique=True)


class Event(BaseModel):
    title = CharField()
    description = TextField(null=True)
    date = DateTimeField()
    location = CharField()
    category = ForeignKeyField(Category, backref="events")
    organizer = ForeignKeyField(User, backref="events")
    # Number of participants is not stored here, it will be counted from registrations: event.registrations.count().


class Registration(BaseModel):
    user = ForeignKeyField(User, backref="registrations")
    event = ForeignKeyField(Event, backref="registrations")


def initialize_database():
    db.connect()
    db.create_tables([User, Category, Event, Registration])
    db.close()
  
