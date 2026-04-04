
from flask import current_app as app, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from application.database import db
from application.models import User, Student, Company
from flask_security import auth_required, current_user
from flask_security.utils import logout_user
from flask_security import auth_required
from flask import render_template
import os
from flask import send_from_directory
from werkzeug.utils import secure_filename


def make_raw(text):
    if not text:
        return ""
    split_list = text.split()
    search_word = ""
    for word in split_list:
        search_word += word.lower()
    return search_word


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_vue_app(path):
    return render_template('index.html')

@app.route('/user-logout', methods=['POST'])
@auth_required('token', 'session')
def user_logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200



@app.route('/user-login', methods=['POST'])
def user_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 400

    if not user.active:
        return jsonify({"message": "Your account has been deactivated or blacklisted."}), 403

    role = user.roles[0].name if user.roles else 'student'

    if role == 'company':
        company = Company.query.filter_by(user_id=user.id).first()
        if company and company.approval_status != 'Approved':
            return jsonify({
                "message": f"Login denied. Your company account status is currently: {company.approval_status}."
            }), 403

    token = user.get_auth_token()

    return jsonify({
        "token": token,
        "role": role,
        "user_id": user.id,
        "message": "Login successful"
    }), 200



@app.route('/user-register', methods=['POST'])
def user_register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password or not role:
        return jsonify({"message": "Missing required fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400

    if role not in ['student', 'company']:
        return jsonify({"message": "Invalid role specified"}), 400

    user_datastore = app.security.datastore
    new_user = user_datastore.create_user(
        email=email,
        password=generate_password_hash(password),
        roles=[role],
        active=True
    )
    db.session.flush()

    if role == 'student':
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        raw_name = make_raw(f"{first_name} {last_name}")
        student_profile = Student(
            user_id=new_user.id,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            search_student_name=raw_name
        )
        db.session.add(student_profile)
        
    elif role == 'company':
        comp_name = data.get('company_name', '')
        raw_comp_name = make_raw(comp_name)
        company_profile = Company(
            user_id=new_user.id,
            company_name=data.get('company_name', ''),
            hr_contact=data.get('hr_contact', ''),
            description=data.get('description', ''),
            website=data.get('website', ''),
            approval_status='Pending',
            search_company_name=raw_comp_name
        )
        db.session.add(company_profile)
    db.session.commit()
    return jsonify({"message": f"{role.capitalize()} registered successfully"}), 201



@app.route('/download-resume/<filename>', methods=['GET'])
@auth_required('token')
def download_resume(filename):
    upload_folder = app.config.get('UPLOAD_FOLDER')
    
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
        
    try:
        return send_from_directory(upload_folder, filename)
    except FileNotFoundError:
        return jsonify({"message": "Resume file not found"}), 404
    


@app.route('/upload-resume', methods=['POST'])
@auth_required('token')
def upload_resume():
    if not current_user.has_role('student'):
        return jsonify({"message": "Only students can upload resumes"}), 403

    if 'file' not in request.files:
        return jsonify({"message": "No file part in the request"}), 400
        
    file = request.files['file']

    if file.filename == '':
        return jsonify({"message": "No file selected for uploading"}), 400

    if file and file.filename.endswith('.pdf'):
        original_filename = secure_filename(file.filename)
        
        safe_filename = f"user_{current_user.id}_{original_filename}"
        
        upload_folder = app.config.get('UPLOAD_FOLDER')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        file_path = os.path.join(upload_folder, safe_filename)
        file.save(file_path)
        
        student = Student.query.filter_by(user_id=current_user.id).first()
        if student:
            student.resume_file = safe_filename
            db.session.commit()
            
        return jsonify({
            "message": "Resume uploaded successfully", 
            "filename": safe_filename
        }), 200
        
    else:
        return jsonify({"message": "Allowed file type is PDF only"}), 400
    
