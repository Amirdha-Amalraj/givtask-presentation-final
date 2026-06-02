from datetime import datetime
from models import db


class Application(db.Model):
    __tablename__ = 'applications'

    id           = db.Column(db.Integer, primary_key=True)
    task_id      = db.Column(db.Integer, db.ForeignKey('tasks.id'),   nullable=False)
    applicant_id = db.Column(db.Integer, db.ForeignKey('users.id'),   nullable=False)
    status       = db.Column(db.String(20), nullable=False, default='pending')  # pending | shortlisted | accepted | rejected
    applied_at   = db.Column(db.DateTime, default=datetime.utcnow)

    VALID_STATUSES = {'pending', 'shortlisted', 'accepted', 'rejected'}

    # Unique constraint: one application per user per task
    __table_args__ = (
        db.UniqueConstraint('task_id', 'applicant_id', name='uq_task_applicant'),
    )

    def to_dict(self, include_task=False, include_applicant=False):
        data = {
            'id':           self.id,
            'task_id':      self.task_id,
            'applicant_id': self.applicant_id,
            'status':       self.status,
            'applied_at':   self.applied_at.isoformat() if self.applied_at else None,
        }
        if include_task and self.task:
            data['task'] = self.task.to_dict(include_ngo=True)
        if include_applicant and self.applicant:
            data['applicant'] = self.applicant.to_dict()
        return data
