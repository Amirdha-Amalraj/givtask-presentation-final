import re


def is_valid_email(email: str) -> bool:
    pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return bool(re.match(pattern, email.strip()))


def validate_registration(data: dict) -> list[str]:
    """Return a list of error messages. Empty list = valid."""
    errors = []

    full_name = (data.get('full_name') or '').strip()
    email     = (data.get('email')     or '').strip()
    password  = (data.get('password')  or '').strip()
    role      = (data.get('role')      or '').strip().lower()

    if not full_name:
        errors.append('full_name is required.')
    elif len(full_name) < 2:
        errors.append('full_name must be at least 2 characters.')

    if not email:
        errors.append('email is required.')
    elif not is_valid_email(email):
        errors.append('email is not valid.')

    if not password:
        errors.append('password is required.')
    elif len(password) < 6:
        errors.append('password must be at least 6 characters.')

    valid_roles = {'volunteer', 'freelancer', 'ngo', 'admin'}
    if not role:
        errors.append('role is required.')
    elif role not in valid_roles:
        errors.append(f'role must be one of: {", ".join(sorted(valid_roles))}.')

    return errors


def validate_task(data: dict) -> list[str]:
    errors = []

    title       = (data.get('title')       or '').strip()
    description = (data.get('description') or '').strip()
    work_mode   = (data.get('work_mode')   or '').strip().lower()
    task_type   = (data.get('task_type')   or '').strip().lower()

    if not title:
        errors.append('title is required.')
    elif len(title) < 5:
        errors.append('title must be at least 5 characters.')

    if not description:
        errors.append('description is required.')
    elif len(description) < 10:
        errors.append('description must be at least 10 characters.')

    if work_mode and work_mode not in {'remote', 'onsite', 'hybrid'}:
        errors.append('work_mode must be remote, onsite, or hybrid.')

    if task_type and task_type not in {'volunteer', 'paid'}:
        errors.append('task_type must be volunteer or paid.')

    return errors


def validate_status_update(status: str) -> list[str]:
    valid = {'pending', 'shortlisted', 'accepted', 'rejected'}
    if status not in valid:
        return [f'status must be one of: {", ".join(sorted(valid))}.']
    return []
