from datetime import datetime
from models import db


class User(db.Model):
    __tablename__ = 'users'

    id         = db.Column(db.Integer, primary_key=True)
    full_name  = db.Column(db.String(120), nullable=False)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    password   = db.Column(db.String(256), nullable=False)   # hashed via werkzeug
    role       = db.Column(db.String(20),  nullable=False)   # volunteer | freelancer | ngo | admin
    city       = db.Column(db.String(80),  nullable=True)
    state      = db.Column(db.String(80),  nullable=True)
    skills     = db.Column(db.Text,        nullable=True)    # comma-separated skill list
    created_at = db.Column(db.DateTime,    default=datetime.utcnow)

    # Relationships
    tasks        = db.relationship('Task',        backref='ngo',       lazy=True, foreign_keys='Task.ngo_id')
    applications = db.relationship('Application', backref='applicant', lazy=True, foreign_keys='Application.applicant_id')

    VALID_ROLES = {'volunteer', 'freelancer', 'ngo', 'admin'}

    def skills_list(self):
        """Return skills as a Python list."""
        if not self.skills:
            return []
        return [s.strip() for s in self.skills.split(',') if s.strip()]

    def to_dict(self):
        return {
            'id':         self.id,
            'full_name':  self.full_name,
            'email':      self.email,
            'role':       self.role,
            'city':       self.city,
            'state':      self.state,
            'skills':     self.skills_list(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
