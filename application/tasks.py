import os
import csv
from celery import shared_task
from datetime import datetime
from application.mail import send_email
from application.models import *
from application.utils import format_report


@shared_task(ignore_result=True)
def send_monthly_student_report(student_user_id):
    user = User.query.get(student_user_id)
    student = Student.query.filter_by(user_id=student_user_id).first()
    
    if not user or not student:
        return "Student not found"

    applications = Application.query.filter_by(student_id=student.id).all()
    
    app_data = []
    for app in applications:
        drive = PlacementDrive.query.get(app.drive_id)
        company = Company.query.get(drive.company_id) if drive else None
        
        app_data.append({
            "company_name": company.company_name if company else "Unknown",
            "job_title": drive.job_title if drive else "Unknown",
            "status": app.status
        })

    data = {
        "student_name": f"{student.first_name} {student.last_name}",
        "applications": app_data
    }

    message = format_report('templates/mail_details.html', data)

    send_email(
        to_address=user.email,
        subject="Your Monthly Placement Application Report",
        message=message,
        content="html"
    )
    
    return f"Report sent to {user.email}"






@shared_task(ignore_result=False)
def export_students_csv():
    export_folder = 'static/exports'
    if not os.path.exists(export_folder):
        os.makedirs(export_folder)

    filename = f'students_export_{datetime.now().strftime("%f")}.csv'
    file_path = os.path.join(export_folder, filename)

    students = Student.query.all()

    with open(file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['Student ID', 'First Name', 'Last Name', 'Branch', 'CGPA', 'Graduation Year'])
        
        for s in students:
            writer.writerow([
                s.id, 
                s.first_name, 
                s.last_name, 
                s.branch or 'N/A', 
                s.cgpa or 'N/A', 
                s.graduation_year or 'N/A'
            ])
    return filename






@shared_task(ignore_result=True)
def send_status_update_email(application_id):
    app_record = Application.query.get(application_id)
    if not app_record:
        return "Application not found"

    student = Student.query.get(app_record.student_id)
    user = User.query.get(student.user_id)
    drive = PlacementDrive.query.get(app_record.drive_id)
    company = Company.query.get(drive.company_id)

    if user and user.active:
        data = {
            "student_name": f"{student.first_name} {student.last_name}",
            "company_name": company.company_name,
            "status": app_record.status
        }
        
        message = format_report('templates/status_update.html', data)
        
        send_email(
            to_address=user.email,
            subject=f"Application Update: {company.company_name}",
            message=message,
            content="html"
        )
        
        return f"Status update email sent to {user.email}."
    
    return "User inactive or not found."







@shared_task(ignore_result=True)
def send_deadline_reminders():
    today = datetime.now().date()
    open_drives = PlacementDrive.query.filter(
        PlacementDrive.status == 'Approved',
        PlacementDrive.application_deadline >= today
    ).all()
    
    if not open_drives:
        return "No open drives found. Zero emails sent."

    users = User.query.filter(User.active == True).all()
    emails_sent = 0

    for user in users:
        if user.has_role('student'):
            student = Student.query.filter_by(user_id=user.id).first()
            if student:
                user_data = {}
                user_data['student_name'] = f"{student.first_name} {student.last_name}"
                user_data['email'] = user.email
                
                user_drives = []
                for drive in open_drives:
                    comp = Company.query.get(drive.company_id)
                    
                    this_drive = {}
                    this_drive["id"] = drive.id
                    this_drive["company_name"] = comp.company_name if comp else "Unknown"
                    this_drive["job_title"] = drive.job_title
                    this_drive["deadline"] = str(drive.application_deadline)
                    
                    user_drives.append(this_drive)
                
                user_data['drives'] = user_drives
                
                message = format_report('templates/deadline_reminder.html', user_data)
                
                send_email(
                    to_address=user.email, 
                    subject="Placement Drive Deadlines Overview", 
                    message=message,
                    content="html"
                )
                emails_sent += 1

    return f"Deadline reminders sent to {emails_sent} students."







@shared_task(ignore_result=True)
def send_monthly_admin_report():
    total_drives = PlacementDrive.query.count()
    total_applications = Application.query.count() 
    total_selected = Application.query.filter(Application.status.in_(['Selected', 'Hired', 'Accepted'])).count()

    report_data = {
        "month_year": datetime.now().strftime("%B %Y"),
        "total_drives": total_drives,
        "total_applications": total_applications,
        "total_selected": total_selected
    }

    message = format_report('templates/admin_monthly_report.html', report_data)

    admins = User.query.filter(User.active == True).all()
    admin_users = [u for u in admins if u.has_role('admin')]
    
    from application.mail import send_email
    emails_sent = 0

    for admin in admin_users:
        send_email(
            to_address=admin.email,
            subject=f"Institute Placement Report: {report_data['month_year']}",
            message=message,
            content="html"
        )
        emails_sent += 1

    return f"Monthly admin reports sent to {emails_sent} admins."








@shared_task(ignore_result=False)
def export_student_history_csv(user_id):
    user = User.query.get(user_id)
    student = Student.query.filter_by(user_id=user.id).first()
    
    if not student:
        return "Student not found"

    export_folder = 'static/exports'
    if not os.path.exists(export_folder):
        os.makedirs(export_folder)

    filename = f'history_{student.id}_{datetime.now().strftime("%f")}.csv'
    file_path = os.path.join(export_folder, filename)

    applications = Application.query.filter_by(student_id=student.id).all()

    with open(file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['Student ID', 'Company Name', 'Drive Title', 'Application Status', 'Application Date'])
        
        for app in applications:
            drive = PlacementDrive.query.get(app.drive_id)
            comp = Company.query.get(drive.company_id) if drive else None
            
            app_date = getattr(app, 'application_date', 'N/A')
            
            writer.writerow([
                student.id,
                comp.company_name if comp else 'N/A',
                drive.job_title if drive else 'N/A',
                app.status,
                str(app_date)
            ])

    from application.mail import send_email
    
    data = {"student_name": f"{student.first_name} {student.last_name}"}
    message = format_report('templates/export_alert.html', data)
    
    send_email(
        to_address=user.email,
        subject="Your Application History Export is Ready",
        message=message,
        content="html"
    )

    return filename