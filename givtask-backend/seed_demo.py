"""
seed_demo.py
------------
Run once to populate the database with realistic demo accounts and tasks.

Usage:
    python seed_demo.py

Safe to re-run: checks for existing data before inserting.
"""

import sys
import os

# Ensure the backend root is on the path when run directly
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from werkzeug.security import generate_password_hash
from app import create_app
from models import db
from models.user import User
from models.task import Task
from models.application import Application


# ── Demo accounts ─────────────────────────────────────────────────────────

DEMO_USERS = [
    # NGOs
    {
        'full_name': 'EduReach Foundation',
        'email':     'ngo@edureach.com',
        'password':  'demo1234',
        'role':      'ngo',
        'city':      'Chennai',
        'state':     'Tamil Nadu',
    },
    {
        'full_name': 'GreenEarth Initiative',
        'email':     'ngo@greenearth.com',
        'password':  'demo1234',
        'role':      'ngo',
        'city':      'Bengaluru',
        'state':     'Karnataka',
    },
    # Volunteers
    {
        'full_name': 'Arjun Mehta',
        'email':     'volunteer@demo.com',
        'password':  'demo1234',
        'role':      'volunteer',
        'city':      'Pune',
        'state':     'Maharashtra',
    },
    {
        'full_name': 'Priya Sharma',
        'email':     'priya@demo.com',
        'password':  'demo1234',
        'role':      'volunteer',
        'city':      'Delhi',
        'state':     'Delhi',
    },
    # Freelancers
    {
        'full_name': 'Kabir Singh',
        'email':     'freelancer@demo.com',
        'password':  'demo1234',
        'role':      'freelancer',
        'city':      'Mumbai',
        'state':     'Maharashtra',
    },
    {
        'full_name': 'Sneha Patel',
        'email':     'sneha@demo.com',
        'password':  'demo1234',
        'role':      'freelancer',
        'city':      'Ahmedabad',
        'state':     'Gujarat',
    },
]


# ── Demo tasks (linked to EduReach ngo_id dynamically) ───────────────────

DEMO_TASKS = [
    {
        'title':           'Build a Donor Management Web App',
        'description':     'We need an experienced full-stack developer to build a donor management portal. The system should handle donor profiles, recurring donations, automated receipts, and impact reports. You will work directly with our tech coordinator.',
        'category':        'Web Development',
        'required_skills': 'React, Node.js, MongoDB',
        'work_mode':       'remote',
        'task_type':       'paid',
        'ngo_key':         'ngo@edureach.com',
    },
    {
        'title':           'Design Brand Identity & Style Guide',
        'description':     'GreenEarth Initiative is looking for a passionate designer to help create a cohesive visual identity — logo, colour palette, typography, and brand guidelines for our growing environmental NGO.',
        'category':        'Graphic Design',
        'required_skills': 'Figma, Branding, Illustration',
        'work_mode':       'remote',
        'task_type':       'volunteer',
        'ngo_key':         'ngo@greenearth.com',
    },
    {
        'title':           'Content Writer for Monthly Newsletter',
        'description':     'We are looking for a dedicated content writer to produce compelling monthly newsletters sharing success stories, impact reports, and upcoming campaigns for our literacy programme.',
        'category':        'Content Writing',
        'required_skills': 'Content Writing, Research, SEO',
        'work_mode':       'remote',
        'task_type':       'volunteer',
        'ngo_key':         'ngo@edureach.com',
    },
    {
        'title':           'Data Analyst — Impact Measurement Dashboard',
        'description':     'We need a data analyst to build an impact measurement dashboard tracking programme outcomes across five districts. You will work with our M&E team to define metrics and automate data pipelines.',
        'category':        'Data Analysis',
        'required_skills': 'Python, Power BI, SQL',
        'work_mode':       'hybrid',
        'task_type':       'paid',
        'ngo_key':         'ngo@edureach.com',
    },
    {
        'title':           'Mobile App UI/UX Design (Figma)',
        'description':     'Design screens for our community health worker mobile app used in rural areas. The app handles patient tracking, appointment scheduling, and health data collection. Deliverable: complete Figma prototype.',
        'category':        'UI/UX Design',
        'required_skills': 'Figma, UI/UX Design, Prototyping',
        'work_mode':       'remote',
        'task_type':       'volunteer',
        'ngo_key':         'ngo@greenearth.com',
    },
    {
        'title':           'Social Media Campaign Manager',
        'description':     'Manage a 3-month awareness campaign across Instagram, Twitter, and LinkedIn for our literacy drive. Includes strategy, content creation, and analytics reporting. Scope: 12 posts/month.',
        'category':        'Marketing',
        'required_skills': 'Social Media, Marketing, Content Writing',
        'work_mode':       'remote',
        'task_type':       'paid',
        'ngo_key':         'ngo@edureach.com',
    },
    {
        'title':           'Legal Research on Child Rights Frameworks',
        'description':     'Assist our legal team with research on international child rights frameworks, specifically UNCRC implementation in South Asian countries. Deliverable: 15-page research brief.',
        'category':        'Legal Aid',
        'required_skills': 'Legal Research, Report Writing',
        'work_mode':       'remote',
        'task_type':       'volunteer',
        'ngo_key':         'ngo@greenearth.com',
    },
    {
        'title':           'Photography & Video Documentation',
        'description':     'Document our tree-planting project installations across three villages. Two-day on-site visit with accommodation provided. Output: 50+ photos and a 3-minute edited video.',
        'category':        'Photography',
        'required_skills': 'Photography, Video Editing',
        'work_mode':       'onsite',
        'task_type':       'volunteer',
        'ngo_key':         'ngo@greenearth.com',
    },
]


def run_seed():
    app = create_app()
    with app.app_context():
        seeded_users    = 0
        seeded_tasks    = 0
        seeded_apps     = 0

        # ── Users ─────────────────────────────────────────────────────────
        user_map = {}   # email → User
        for ud in DEMO_USERS:
            existing = User.query.filter_by(email=ud['email']).first()
            if existing:
                user_map[ud['email']] = existing
                print(f'  [skip] User already exists: {ud["email"]}')
            else:
                u = User(
                    full_name = ud['full_name'],
                    email     = ud['email'],
                    password  = generate_password_hash(ud['password']),
                    role      = ud['role'],
                    city      = ud.get('city'),
                    state     = ud.get('state'),
                )
                db.session.add(u)
                db.session.flush()   # get u.id before commit
                user_map[ud['email']] = u
                seeded_users += 1
                print(f'  [create] User: {ud["email"]} ({ud["role"]})')

        db.session.commit()

        # ── Tasks ─────────────────────────────────────────────────────────
        task_map = {}   # title → Task
        for td in DEMO_TASKS:
            ngo = user_map.get(td['ngo_key'])
            if not ngo:
                print(f'  [warn] NGO not found for task: {td["title"]}')
                continue

            existing = Task.query.filter_by(title=td['title'], ngo_id=ngo.id).first()
            if existing:
                task_map[td['title']] = existing
                print(f'  [skip] Task already exists: {td["title"]}')
            else:
                t = Task(
                    title           = td['title'],
                    description     = td['description'],
                    category        = td['category'],
                    required_skills = td['required_skills'],
                    work_mode       = td['work_mode'],
                    task_type       = td['task_type'],
                    ngo_id          = ngo.id,
                )
                db.session.add(t)
                db.session.flush()
                task_map[td['title']] = t
                seeded_tasks += 1
                print(f'  [create] Task: {td["title"]} ({td["task_type"]} / {td["work_mode"]})')

        db.session.commit()

        # ── Sample applications ────────────────────────────────────────────
        # Arjun (volunteer) applies to two tasks
        # Kabir (freelancer) applies to two paid tasks
        demo_apps = [
            {
                'applicant_email': 'volunteer@demo.com',
                'task_title':      'Build a Donor Management Web App',
                'status':          'shortlisted',
            },
            {
                'applicant_email': 'volunteer@demo.com',
                'task_title':      'Content Writer for Monthly Newsletter',
                'status':          'pending',
            },
            {
                'applicant_email': 'freelancer@demo.com',
                'task_title':      'Mobile App UI/UX Design (Figma)',
                'status':          'pending',
            },
            {
                'applicant_email': 'freelancer@demo.com',
                'task_title':      'Social Media Campaign Manager',
                'status':          'shortlisted',
            },
            {
                'applicant_email': 'priya@demo.com',
                'task_title':      'Design Brand Identity & Style Guide',
                'status':          'pending',
            },
            {
                'applicant_email': 'sneha@demo.com',
                'task_title':      'Data Analyst — Impact Measurement Dashboard',
                'status':          'pending',
            },
        ]

        for ad in demo_apps:
            applicant = user_map.get(ad['applicant_email'])
            task      = task_map.get(ad['task_title'])
            if not applicant or not task:
                print(f'  [warn] Skipping application — user or task not found: {ad}')
                continue

            existing = Application.query.filter_by(
                task_id=task.id, applicant_id=applicant.id
            ).first()
            if existing:
                print(f'  [skip] Application already exists: {applicant.full_name} → {task.title}')
            else:
                a = Application(
                    task_id      = task.id,
                    applicant_id = applicant.id,
                    status       = ad['status'],
                )
                db.session.add(a)
                seeded_apps += 1
                print(f'  [create] Application: {applicant.full_name} → {task.title} [{ad["status"]}]')

        db.session.commit()

        print()
        print('─' * 50)
        print(f'Seed complete: {seeded_users} users, {seeded_tasks} tasks, {seeded_apps} applications')
        print('─' * 50)
        print()
        print('Demo accounts (password: demo1234 for all)')
        print('  NGO:        ngo@edureach.com')
        print('  NGO:        ngo@greenearth.com')
        print('  Volunteer:  volunteer@demo.com')
        print('  Freelancer: freelancer@demo.com')
        print('  Admin:      admin@givtask.com  (password: admin123)')


if __name__ == '__main__':
    run_seed()
