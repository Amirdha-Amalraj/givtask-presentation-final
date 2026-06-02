from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash

from models import db
from models.user import User
from services.validation import validate_registration
from utils.helpers import success, error

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}

    # Validate input
    errors = validate_registration(data)
    if errors:
        return error('; '.join(errors), 422)

    email = data['email'].strip().lower()
    role  = data['role'].strip().lower()

    # Check email uniqueness
    if User.query.filter_by(email=email).first():
        return error('An account with this email already exists.', 409)

    # Normalise skills: accept list or comma-string
    raw_skills = data.get('skills', '')
    if isinstance(raw_skills, list):
        skills_str = ', '.join(s.strip() for s in raw_skills if s.strip())
    else:
        skills_str = str(raw_skills).strip()

    user = User(
        full_name = data['full_name'].strip(),
        email     = email,
        password  = generate_password_hash(data['password']),
        role      = role,
        city      = (data.get('city')  or '').strip() or None,
        state     = (data.get('state') or '').strip() or None,
        skills    = skills_str or None,
    )
    db.session.add(user)
    db.session.commit()

    return success(user.to_dict(), 'Registration successful.', 201)


@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}

    email    = (data.get('email')    or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return error('email and password are required.', 422)

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return error('Invalid email or password.', 401)

    return success(user.to_dict(), 'Login successful.')


@auth_bp.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Return public user profile including skills."""
    user = User.query.get(user_id)
    if not user:
        return error('User not found.', 404)
    return success(user.to_dict())


@auth_bp.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update a user's profile (full_name, city, state)."""
    user = User.query.get(user_id)
    if not user:
        return error('User not found.', 404)

    data = request.get_json(silent=True) or {}
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'city' in data:
        user.city = (data['city'] or '').strip() or None
    if 'state' in data:
        user.state = (data['state'] or '').strip() or None

    db.session.commit()
    return success(user.to_dict(), 'Profile updated.')


@auth_bp.route('/api/users/<int:user_id>/skills', methods=['PUT'])
def update_skills(user_id):
    """Update a user's skills list."""
    user = User.query.get(user_id)
    if not user:
        return error('User not found.', 404)

    data = request.get_json(silent=True) or {}
    raw_skills = data.get('skills', '')
    if isinstance(raw_skills, list):
        skills_str = ', '.join(s.strip() for s in raw_skills if s.strip())
    else:
        skills_str = str(raw_skills).strip()

    user.skills = skills_str or None
    db.session.commit()
    return success(user.to_dict(), 'Skills updated.')
