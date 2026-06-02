# Models package — import db from here so all models share the same instance
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
