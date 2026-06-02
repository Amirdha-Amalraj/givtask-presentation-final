from flask import Blueprint, request

from models import db
from models.task import Task
from models.user import User
from services.validation import validate_task
from utils.helpers import success, error

tasks_bp = Blueprint('tasks', __name__)


# ── Helpers ────────────────────────────────────────────────────────────────

def _get_ngo_or_error(ngo_id):
    """Return (User, None) if valid NGO, else (None, error_response)."""
    if not ngo_id:
        return None, error('ngo_id is required.', 422)
    ngo = User.query.get(ngo_id)
    if not ngo:
        return None, error('NGO user not found.', 404)
    if ngo.role != 'ngo':
        return None, error('Only NGO accounts can manage tasks.', 403)
    return ngo, None


# ── GET /api/tasks ─────────────────────────────────────────────────────────

@tasks_bp.route('/api/tasks', methods=['GET'])
def get_tasks():
    """
    List tasks with optional filters.
    Query params:
      search      – full-text search in title / description / skills
      task_type   – volunteer | paid
      work_mode   – remote | onsite | hybrid
      category    – exact match
      ngo_id      – filter by NGO
    """
    query = Task.query

    search    = request.args.get('search', '').strip()
    task_type = request.args.get('task_type', '').strip().lower()
    work_mode = request.args.get('work_mode', '').strip().lower()
    category  = request.args.get('category',  '').strip()
    ngo_id    = request.args.get('ngo_id',    type=int)

    if search:
        like = f'%{search}%'
        query = query.filter(
            db.or_(
                Task.title.ilike(like),
                Task.description.ilike(like),
                Task.required_skills.ilike(like),
            )
        )

    if task_type in Task.VALID_TASK_TYPES:
        query = query.filter_by(task_type=task_type)

    if work_mode in Task.VALID_WORK_MODES:
        query = query.filter_by(work_mode=work_mode)

    if category:
        query = query.filter(Task.category.ilike(f'%{category}%'))

    if ngo_id:
        query = query.filter_by(ngo_id=ngo_id)

    tasks = query.order_by(Task.created_at.desc()).all()
    return success([t.to_dict() for t in tasks])


# ── GET /api/tasks/<id> ────────────────────────────────────────────────────

@tasks_bp.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return error('Task not found.', 404)
    return success(task.to_dict())


# ── POST /api/tasks ────────────────────────────────────────────────────────

@tasks_bp.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json(silent=True) or {}

    ngo_id = data.get('ngo_id')
    ngo, err = _get_ngo_or_error(ngo_id)
    if err:
        return err

    errors = validate_task(data)
    if errors:
        return error('; '.join(errors), 422)

    # Normalise skills: accept list or comma-string
    raw_skills = data.get('required_skills', '')
    if isinstance(raw_skills, list):
        skills_str = ', '.join(s.strip() for s in raw_skills if s.strip())
    else:
        skills_str = str(raw_skills).strip()

    task = Task(
        title           = data['title'].strip(),
        description     = data['description'].strip(),
        category        = (data.get('category') or '').strip() or None,
        required_skills = skills_str or None,
        work_mode       = (data.get('work_mode') or 'remote').strip().lower(),
        task_type       = (data.get('task_type') or 'volunteer').strip().lower(),
        ngo_id          = ngo_id,
    )
    db.session.add(task)
    db.session.commit()

    return success(task.to_dict(), 'Task created successfully.', 201)


# ── PUT /api/tasks/<id> ────────────────────────────────────────────────────

@tasks_bp.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return error('Task not found.', 404)

    data   = request.get_json(silent=True) or {}
    ngo_id = data.get('ngo_id')

    # Only the owning NGO can edit
    if ngo_id and int(ngo_id) != task.ngo_id:
        return error('You do not have permission to edit this task.', 403)

    errors = validate_task({**{'title': task.title, 'description': task.description}, **data})
    if errors:
        return error('; '.join(errors), 422)

    if 'title'       in data: task.title       = data['title'].strip()
    if 'description' in data: task.description = data['description'].strip()
    if 'category'    in data: task.category    = (data['category'] or '').strip() or None
    if 'work_mode'   in data: task.work_mode   = data['work_mode'].strip().lower()
    if 'task_type'   in data: task.task_type   = data['task_type'].strip().lower()

    if 'required_skills' in data:
        raw = data['required_skills']
        if isinstance(raw, list):
            task.required_skills = ', '.join(s.strip() for s in raw if s.strip()) or None
        else:
            task.required_skills = str(raw).strip() or None

    db.session.commit()
    return success(task.to_dict(), 'Task updated successfully.')


# ── DELETE /api/tasks/<id> ─────────────────────────────────────────────────

@tasks_bp.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return error('Task not found.', 404)

    data   = request.get_json(silent=True) or {}
    ngo_id = data.get('ngo_id')

    if ngo_id and int(ngo_id) != task.ngo_id:
        return error('You do not have permission to delete this task.', 403)

    db.session.delete(task)
    db.session.commit()
    return success(message='Task deleted successfully.')
