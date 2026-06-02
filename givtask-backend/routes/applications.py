from flask import Blueprint, request
from sqlalchemy.exc import IntegrityError

from models import db
from models.application import Application
from models.task import Task
from models.user import User
from services.validation import validate_status_update
from utils.helpers import success, error

applications_bp = Blueprint('applications', __name__)


# ── POST /api/applications ─────────────────────────────────────────────────

@applications_bp.route('/api/applications', methods=['POST'])
def apply():
    data = request.get_json(silent=True) or {}

    task_id      = data.get('task_id')
    applicant_id = data.get('applicant_id')

    if not task_id or not applicant_id:
        return error('task_id and applicant_id are required.', 422)

    # Validate task exists
    task = Task.query.get(task_id)
    if not task:
        return error('Task not found.', 404)

    # Validate applicant exists and has correct role
    applicant = User.query.get(applicant_id)
    if not applicant:
        return error('Applicant user not found.', 404)
    if applicant.role not in ('volunteer', 'freelancer'):
        return error('Only volunteers or freelancers can apply to tasks.', 403)

    # NGOs cannot apply to their own tasks
    if task.ngo_id == applicant_id:
        return error('NGO owners cannot apply to their own tasks.', 403)

    # Check for duplicate
    existing = Application.query.filter_by(
        task_id=task_id, applicant_id=applicant_id
    ).first()
    if existing:
        return error('You have already applied to this task.', 409)

    application = Application(
        task_id      = task_id,
        applicant_id = applicant_id,
        status       = 'pending',
    )
    db.session.add(application)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error('You have already applied to this task.', 409)

    return success(
        application.to_dict(include_task=True),
        'Application submitted successfully.',
        201,
    )


# ── GET /api/applications/task/<task_id> ──────────────────────────────────

@applications_bp.route('/api/applications/task/<int:task_id>', methods=['GET'])
def get_applications_for_task(task_id):
    """Return all applications for a task (used by the NGO dashboard)."""
    task = Task.query.get(task_id)
    if not task:
        return error('Task not found.', 404)

    apps = (
        Application.query
        .filter_by(task_id=task_id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return success([a.to_dict(include_applicant=True) for a in apps])


# ── GET /api/applications/user/<user_id> ──────────────────────────────────

@applications_bp.route('/api/applications/user/<int:user_id>', methods=['GET'])
def get_applications_for_user(user_id):
    """Return all applications submitted by a volunteer/freelancer."""
    user = User.query.get(user_id)
    if not user:
        return error('User not found.', 404)

    apps = (
        Application.query
        .filter_by(applicant_id=user_id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return success([a.to_dict(include_task=True) for a in apps])


# ── PATCH /api/applications/<id>/status ──────────────────────────────────

@applications_bp.route('/api/applications/<int:app_id>/status', methods=['PATCH'])
def update_status(app_id):
    """Allow NGO to update the status of an application."""
    application = Application.query.get(app_id)
    if not application:
        return error('Application not found.', 404)

    data      = request.get_json(silent=True) or {}
    new_status = (data.get('status') or '').strip().lower()
    ngo_id     = data.get('ngo_id')

    # Verify requesting user owns the task
    if ngo_id:
        task = Task.query.get(application.task_id)
        if task and int(ngo_id) != task.ngo_id:
            return error('You do not have permission to update this application.', 403)

    errors = validate_status_update(new_status)
    if errors:
        return error('; '.join(errors), 422)

    application.status = new_status
    db.session.commit()

    return success(
        application.to_dict(include_applicant=True),
        f'Application status updated to "{new_status}".',
    )
