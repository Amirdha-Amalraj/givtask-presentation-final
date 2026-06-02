import os
from flask import Flask
from flask_cors import CORS

from config import Config
from models import db
from models.user import User        # noqa: F401 — must import so SQLAlchemy registers the table
from models.task import Task        # noqa: F401
from models.application import Application  # noqa: F401

from routes.auth import auth_bp
from routes.tasks import tasks_bp
from routes.applications import applications_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS: use env var in production, default to * for demo
    cors_origins = app.config.get('CORS_ORIGINS', '*')
    CORS(app, resources={r'/api/*': {'origins': cors_origins}})

    # Initialise extensions
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(applications_bp)

    # Create database tables if they don't exist
    with app.app_context():
        os.makedirs(os.path.join(os.path.dirname(__file__), 'database'), exist_ok=True)
        db.create_all()
        _seed_admin_if_empty()

    return app


def _seed_admin_if_empty():
    """Create a default admin account on first run so the demo works immediately."""
    from werkzeug.security import generate_password_hash
    if User.query.filter_by(role='admin').first():
        return
    admin = User(
        full_name = 'GivTask Admin',
        email     = 'admin@givtask.com',
        password  = generate_password_hash('admin123'),
        role      = 'admin',
    )
    db.session.add(admin)
    db.session.commit()
    print('[GivTask] Default admin created: admin@givtask.com / admin123')


# ── Health check ──────────────────────────────────────────────────────────
app = create_app()


@app.route('/api/health', methods=['GET'])
def health():
    return {'status': 'ok', 'message': 'GivTask API is running.'}, 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
