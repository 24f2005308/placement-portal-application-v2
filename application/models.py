from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(255), unique=True, nullable=True)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    
    roles = db.relationship('Role', secondary='users_roles', backref=db.backref('users', lazy='dynamic'))
    company_profile = db.relationship('Company', backref='user', uselist=False, cascade="all, delete")
    student_profile = db.relationship('Student', backref='user', uselist=False, cascade="all, delete")


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))


class UsersRoles(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer(), db.ForeignKey('role.id'))


class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    company_name = db.Column(db.String(100), nullable=False)
    search_company_name = db.Column(db.String(255))
    description = db.Column(db.Text, nullable=True)
    hr_contact = db.Column(db.String(100), nullable=False)
    website = db.Column(db.String(255), nullable=True)
    approval_status = db.Column(db.String(50), default='Pending')

    drives = db.relationship('PlacementDrive', backref='company', lazy=True, cascade="all, delete")


class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    search_student_name = db.Column(db.String(255))
    dob = db.Column(db.Date, nullable=True)
    branch = db.Column(db.String(100), nullable=True)
    cgpa = db.Column(db.Float, nullable=True)
    graduation_year = db.Column(db.Integer, nullable=True)
    resume_file = db.Column(db.String(255), nullable=True)

    applications = db.relationship('Application', backref='student', lazy=True, cascade="all, delete")


class PlacementDrive(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    job_title = db.Column(db.String(255), nullable=False)
    search_job_title = db.Column(db.String(255))
    job_description = db.Column(db.Text, nullable=False)
    job_salary = db.Column(db.Integer, nullable=True)       
    job_location = db.Column(db.String(255), nullable=True) 
    eligibility_branch = db.Column(db.String(255), nullable=True)
    eligibility_cgpa = db.Column(db.Float, nullable=True)
    eligibility_year = db.Column(db.Integer, nullable=True)
    drive_date = db.Column(db.Date, default=datetime.utcnow)
    application_deadline = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='Pending')

    applications = db.relationship('Application', backref='drive', lazy=True, cascade="all, delete")


class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    drive_id = db.Column(db.Integer, db.ForeignKey('placement_drive.id'), nullable=False)
    application_date = db.Column(db.Date, default=datetime.utcnow)
    interview_type = db.Column(db.String(50), nullable=True) 
    remark = db.Column(db.String(255), nullable=True)        
    status = db.Column(db.String(50), default='Applied') 