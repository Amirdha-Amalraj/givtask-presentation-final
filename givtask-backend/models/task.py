from datetime import datetime
from models import db


class Task(db.Model):
    __tablename__ = 'tasks'

    id              = db.Column(db.Integer, primary_key=True)
    title           = db.Column(db.String(200), nullable=False)
    description     = db.Column(db.Text,        nullable=False)
    category        = db.Column(db.String(100), nullable=True)
    required_skills = db.Column(db.Text,        nullable=True)   # comma-separated string
    work_mode       = db.Column(db.String(20),  nullable=False, default='remote')   # remote | onsite | hybrid
    task_type       = db.Column(db.String(20),  nullable=False, default='volunteer') # volunteer | paid
    ngo_id          = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    applications = db.relationship('Application', backref='task', lazy=True, cascade='all, delete-orphan')

    VALID_WORK_MODES  = {'remote', 'onsite', 'hybrid'}
    VALID_TASK_TYPES  = {'volunteer', 'paid'}

    def skills_list(self):
        if not self.required_skills:
            return []
        return [s.strip() for s in self.required_skills.split(',') if s.strip()]

    def to_dict(self, include_ngo=True):
        data = {
            'id':              self.id,
            'title':           self.title,
            'description':     self.description,
            'category':        self.category,
            'required_skills': self.skills_list(),
            'work_mode':       self.work_mode,
            'task_type':       self.task_type,
            'ngo_id':          self.ngo_id,
            'created_at':      self.created_at.isoformat() if self.created_at else None,
            'application_count': len(self.applications),
        }
        if include_ngo and self.ngo:
            data['ngo_name'] = self.ngo.full_name
        return data
