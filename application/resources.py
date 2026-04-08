from flask import request
from flask_restful import Resource, Api, reqparse
from flask_security import auth_required, current_user
from application.models import*
from datetime import datetime
from application.cache import cache

api = Api(prefix='/api')

def make_raw(text):
    if not text:
        return ""
    split_list = text.split()
    search_word = ""
    for word in split_list:
        search_word += word.lower()
    return search_word

# Company Parsers
company_put_parser = reqparse.RequestParser()
company_put_parser.add_argument('approval_status', type=str)
company_put_parser.add_argument('active', type=bool)
company_put_parser.add_argument('description', type=str)
company_put_parser.add_argument('website', type=str)
company_put_parser.add_argument('hr_contact', type=str)

# Student Parsers
student_put_parser = reqparse.RequestParser()
student_put_parser.add_argument('active', type=bool)
student_put_parser.add_argument('first_name', type=str)
student_put_parser.add_argument('last_name', type=str)
student_put_parser.add_argument('branch', type=str)
student_put_parser.add_argument('cgpa', type=float)
student_put_parser.add_argument('graduation_year', type=int)

# Placement Drive Parsers
drive_post_parser = reqparse.RequestParser()
drive_post_parser.add_argument('job_title', type=str, required=True, help="Job title is required")
drive_post_parser.add_argument('job_description', type=str, required=True, help="Job description is required")
drive_post_parser.add_argument('application_deadline', type=str, required=True, help="Deadline is required (YYYY-MM-DD)")
drive_post_parser.add_argument('job_salary', type=int)
drive_post_parser.add_argument('job_location', type=str)
drive_post_parser.add_argument('eligibility_branch', type=str)
drive_post_parser.add_argument('eligibility_cgpa', type=float)
drive_post_parser.add_argument('eligibility_year', type=int)

drive_put_parser = reqparse.RequestParser()
drive_put_parser.add_argument('status', type=str)
drive_put_parser.add_argument('job_title', type=str)
drive_put_parser.add_argument('job_description', type=str)
drive_put_parser.add_argument('job_salary', type=int)
drive_put_parser.add_argument('job_location', type=str)
drive_put_parser.add_argument('application_deadline', type=str)

# Application Parsers
app_post_parser = reqparse.RequestParser()
app_post_parser.add_argument('drive_id', type=int, required=True, help="Drive ID is required")

app_put_parser = reqparse.RequestParser()
app_put_parser.add_argument('status', type=str)
app_put_parser.add_argument('interview_type', type=str)
app_put_parser.add_argument('remark', type=str)



# API CLASSES

class AdminDashboardResource(Resource):
    @auth_required('token')
    @cache.cached(timeout=60, query_string = True)
    def get(self):
        if not current_user.has_role('admin'):
            return {"message": "Unauthorized"}, 403

        return {
            "total_students": Student.query.count(),
            "total_companies": Company.query.count(),
            "total_drives": PlacementDrive.query.count()
        }, 200


class CompanyResource(Resource):
    @auth_required('token')
    @cache.cached(timeout=60, query_string=True)
    def get(self, id=None):
        if id:
            company = Company.query.get(id)
            if not company:
                return {"message": "Company not found"}, 404
            return {
                "id": company.id,
                "company_name": company.company_name,
                "hr_contact": company.hr_contact,
                "description": company.description,
                "website": company.website,
                "approval_status": company.approval_status
            }, 200
        
        search_query = request.args.get('search_word')
        if search_query:
            raw_search = make_raw(search_query)
            companies = Company.query.filter(Company.search_company_name.like(f'%{raw_search}%')).all()
        else:
            companies = Company.query.all()

        result = []
        for c in companies:
            user = User.query.get(c.user_id)
            result.append({
                "id": c.id,
                "company_name": c.company_name,
                "approval_status": c.approval_status,
                "active": user.active if user else False,
                "website": c.website
            })
        return result, 200

    @auth_required('token')
    def put(self, id):
        company = Company.query.get(id)
        if not company:
            return {"message": "Company not found"}, 404
        args = company_put_parser.parse_args()

        if current_user.has_role('admin'):
            if args.get('approval_status'):
                company.approval_status = args['approval_status']
            if args.get('active') is not None:
                user = User.query.get(company.user_id)
                if user:
                    user.active = args['active']
            db.session.commit()
            cache.clear()
            return {"message": "Company status updated by Admin"}, 200

        if current_user.has_role('company') and company.user_id == current_user.id:
            if args.get('description'):
                company.description = args['description']
            if args.get('website'):
                company.website = args['website']
            if args.get('hr_contact'):
                company.hr_contact = args['hr_contact']
            db.session.commit()
            cache.clear()
            return {"message": "Company profile updated successfully"}, 200

        return {"message": "Unauthorized action"}, 403


class StudentResource(Resource):
    @auth_required('token')
    @cache.cached(timeout=60, query_string=True)

    def get(self, id=None):
        if id:
            student = Student.query.get(id)
            if not student:
                return {"message": "Student not found"}, 404
            user = User.query.get(student.user_id)
            return {
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "branch": student.branch,
                "cgpa": student.cgpa,
                "graduation_year": student.graduation_year,
                "resume_file": student.resume_file,
                "email": user.email if user else "",
                "active": user.active if user else False
            }, 200

        search_query = request.args.get('search_word')
        if search_query:
            raw_search = make_raw(search_query)
            students = Student.query.filter(Student.search_student_name.like(f'%{raw_search}%')).all()
        else:
            students = Student.query.all()

        result = []
        for s in students:
            user = User.query.get(s.user_id)
            result.append({
                "id": s.id,
                "user_id": s.user_id,
                "first_name": s.first_name,
                "last_name": s.last_name,
                "branch": s.branch,
                "active": user.active if user else False
            })
        return result, 200

    @auth_required('token')
    def put(self, id):
        student = Student.query.get(id)
        if not student:
            return {"message": "Student not found"}, 404
        args = student_put_parser.parse_args()

        if current_user.has_role('admin'):
            if args.get('active') is not None:
                user = User.query.get(student.user_id)
                if user:
                    user.active = args['active']
                db.session.commit()
                cache.clear()
                return {"message": "Student status updated by Admin"}, 200

        if current_user.has_role('student') and student.user_id == current_user.id:
            if args.get('first_name'):
                student.first_name = args['first_name']
            if args.get('last_name'):
                student.last_name = args['last_name']
            if args.get('branch'):
                student.branch = args['branch']
            if args.get('cgpa'):
                student.cgpa = args['cgpa']
            if args.get('graduation_year'):
                student.graduation_year = args['graduation_year']
            db.session.commit()
            cache.clear()
            return {"message": "Student profile updated successfully"}, 200

        return {"message": "Unauthorized action"}, 403


class PlacementDriveResource(Resource):
    @auth_required('token')
    @cache.cached(timeout=60, query_string=True)
    def get(self, id=None):
        if id:
            drive = PlacementDrive.query.get(id)
            if not drive:
                return {"message": "Drive not found"}, 404
            comp = Company.query.get(drive.company_id)
            return {
                "id": drive.id,
                "company_name": comp.company_name if comp else "Unknown",
                "job_title": drive.job_title,
                "job_description": drive.job_description,
                "job_salary": drive.job_salary,
                "job_location": drive.job_location,
                "eligibility_branch": drive.eligibility_branch,
                "eligibility_cgpa": drive.eligibility_cgpa,
                "eligibility_year": drive.eligibility_year,
                "application_deadline": str(drive.application_deadline),
                "status": drive.status
            }, 200

        search_query = request.args.get('search_word')

        company = None
        if current_user.has_role('company'):
            company = Company.query.filter_by(user_id=current_user.id).first()

        if search_query:
            raw_search = make_raw(search_query)

            if company:
                drives = PlacementDrive.query.filter(
                    PlacementDrive.company_id == company.id,
                    PlacementDrive.search_job_title.like(f'%{raw_search}%')
                ).all()
            else:
                drives = PlacementDrive.query.filter(
                    PlacementDrive.search_job_title.like(f'%{raw_search}%')
                ).all()

        else:
            if company:
                drives = PlacementDrive.query.filter_by(company_id=company.id).all()
            else:
                drives = PlacementDrive.query.all()

        result = []
        for d in drives:
            comp = Company.query.get(d.company_id)
            result.append({
                "id": d.id,
                "company_id": d.company_id,
                "job_title": d.job_title,
                "job_location": d.job_location,
                "status": d.status,
                "application_deadline": str(d.application_deadline),
                "company_name": comp.company_name if comp else "Unknown",
                "eligibility_cgpa": d.eligibility_cgpa
            })
        return result, 200

    @auth_required('token')
    def post(self):
        if not current_user.has_role('company'):
            return {"message": "Only companies can create drives"}, 403

        company = Company.query.filter_by(user_id=current_user.id).first()
        if company.approval_status != 'Approved':
            return {"message": "Company not approved"}, 403

        args = drive_post_parser.parse_args()
        raw_title = make_raw(args['job_title'])

        try:
            deadline = datetime.strptime(args['application_deadline'], '%Y-%m-%d').date()
        except:
            return {"message": "Invalid date format"}, 400

        new_drive = PlacementDrive(
            company_id=company.id,
            job_title=args['job_title'],
            job_description=args['job_description'],
            job_salary=args.get('job_salary'),
            job_location=args.get('job_location'),
            eligibility_branch=args.get('eligibility_branch'),
            eligibility_cgpa=args.get('eligibility_cgpa'),
            eligibility_year=args.get('eligibility_year'),
            application_deadline=deadline,
            status='Pending',
            search_job_title=raw_title
        )

        db.session.add(new_drive)
        db.session.commit()
        cache.clear()
        return {"message": "Drive created successfully"}, 201

    @auth_required('token')
    def put(self, id):
        drive = PlacementDrive.query.get(id)
        if not drive: return {"message": "Drive not found"}, 404
        
        args = drive_put_parser.parse_args()

        if current_user.has_role('admin') and args.get('status'):
            drive.status = args['status']
            db.session.commit()
            cache.clear()
            return {"message": "Drive status updated by Admin"}, 200
            
        if current_user.has_role('company'):
            comp = Company.query.filter_by(user_id=current_user.id).first()
            if comp and drive.company_id == comp.id:
                if args.get('job_title'): 
                    drive.job_title = args['job_title'] 
                    drive.search_job_title = make_raw(args['job_title'])
                if args.get('status'): drive.status = args['status']
                if args.get('job_description'): drive.job_description = args['job_description']
                if args.get('job_salary'): drive.job_salary = args['job_salary']
                if args.get('job_location'): drive.job_location = args['job_location']
                if args.get('application_deadline'): 
                    try: drive.application_deadline = datetime.strptime(args['application_deadline'], '%Y-%m-%d').date()
                    except: pass
                db.session.commit()
                cache.clear()
                return {"message": "Drive details updated"}, 200

        return {"message": "Unauthorized action"}, 403


class ApplicationResource(Resource):
    @auth_required('token')
    @cache.cached(timeout=60)
    def get(self, id=None):
        apps = Application.query.all()
        result = []
        for a in apps:
            student = Student.query.get(a.student_id)
            drive = PlacementDrive.query.get(a.drive_id)
            comp = Company.query.get(drive.company_id) if drive else None

            result.append({
                "id": a.id,
                "student_name": student.first_name + " " + student.last_name if student else "",
                "student_id": student.id if student else None,
                "drive_id": a.drive_id,
                "job_title": drive.job_title if drive else "",
                "company_name": comp.company_name if comp else "",
                "application_date": str(a.application_date) if hasattr(a, "application_date") else "",
                "status": getattr(a, 'status', 'Applied'),
                "remark": getattr(a, 'remark', ''),
                "interview_type": getattr(a, 'interview_type', '')
            })
        return result, 200

    @auth_required('token')
    def post(self):
        if not current_user.has_role('student'):
            return {"message": "Only students can apply"}, 403

        student = Student.query.filter_by(user_id=current_user.id).first()
        args = app_post_parser.parse_args()
        drive = PlacementDrive.query.get(args['drive_id'])

        if not drive or drive.status != 'Approved':
            return {"message": "Invalid drive"}, 400

        new_application = Application(
            student_id=student.id,
            drive_id=drive.id,
            status='Applied'
        )

        db.session.add(new_application)
        db.session.commit()
        cache.clear()
        return {"message": "Application submitted successfully"}, 201
    
    @auth_required('token')
    def put(self, id):
        app_record = Application.query.get(id)
        if not app_record:
            return {"message": "Application not found"}, 404

        args = app_put_parser.parse_args()
        
        status_changed = False
        if args.get('status') and args['status'] != app_record.status:
            app_record.status = args['status']
            status_changed = True
            
        if args.get('remark') is not None:
            app_record.remark = args['remark']

        db.session.commit()
        cache.clear()

        if status_changed:
            from application.tasks import send_status_update_email
            send_status_update_email.delay(app_record.id)

        return {"message": "Application updated successfully"}, 200


# REGISTER RESOURCES

api.add_resource(AdminDashboardResource, '/admin/dashboard') 
api.add_resource(CompanyResource, '/companies', '/companies/<int:id>')
api.add_resource(StudentResource, '/students', '/students/<int:id>')
api.add_resource(PlacementDriveResource, '/drives', '/drives/<int:id>')
api.add_resource(ApplicationResource, '/applications', '/applications/<int:id>')