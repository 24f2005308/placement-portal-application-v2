# Placement Portal Application
A full-stack Placement Management System designed to streamline the interaction between Students, Companies, and Admins. This platform allows companies to post placement drives, students to apply, and admins to manage the entire workflow efficiently.




Features
    Student Features
        Register & Login
        View approved companies and drives
        Apply to placement drives
        Track application status
        Upload resume (PDF only)
        Edit profile (CGPA, branch, graduation year, etc.)
        Export application history (CSV)
        Receive email notifications (reports, reminders)
    Company Features
        Register (requires admin approval)
        Create placement drives
        Edit / resubmit rejected drives
        View applicants
        Update application status (Shortlist / Select / Reject)
        Close or extend drives
    Admin Features
        Approve / Reject companies
        Approve / Reject drives
        View all students, companies, applications
        Block / Unblock users
        Export student data (CSV)
        Monitor system stats (dashboard)




System Architecture
    Frontend (Vue.js)
            ↓
    Backend (Flask + Flask-RESTful)
            ↓
    Database (SQLite)
            ↓
    Background Tasks (Celery + Redis)



Tech Stack
    Frontend
        Vue.js 2
        Vue Router
        Bootstrap 5
    Backend
        Flask
        Flask-RESTful
        Flask-Security (Authentication & RBAC)
    Database
        SQLite (via SQLAlchemy ORM)
    Background Processing
        Celery
        Redis (for caching + task queue)





Project Structure

    24f2005308/
    │
    ├── application/
    │   ├── models.py          # Database models
    │   ├── routes.py          # Authentication & main routes
    │   ├── resources.py       # REST APIs
    │   ├── tasks.py           # Celery background tasks
    │   ├── database.py        # DB initialization  
    │   
    │── instance/
    │   ├── ppav2.sqlite3      # Database
    │
    ├── static/
    │   ├── script.js          # Vue Router setup
    │   ├── components/        # Vue components (Dashboard, Login, etc.)
    │   ├── exports/            # csv exported files
    │   ├── resumes/            # pdf uploaded files
    │
    ├── templates/
    │   ├── index.html         # Main frontend entry
    │   ├── email templates    # Reminder & report emails
    │
    ├── app.py                 # Main Flask app






Authentication & Roles
    The system uses Role-Based Access Control (RBAC):
    Admin
    Company
    Student
    Users are authenticated using token-based authentication via Flask-Security .





Key Functionalities
    Placement Drive Flow
        Company creates drive → status = Pending
        Admin approves → status = Approved
        Students apply
        Company updates application status
        Drive can be marked as Closed

    Email System (Celery Tasks)
        Background tasks include:
            Monthly student report
            Daily resume reminder
            Deadline reminders
            Application status updates
            Admin monthly report
            Handled asynchronously using Celery .

    CSV Export
        Admin → Export all students
        Student → Export personal application history
        Uses background jobs + polling for status tracking .







Setup Instructions
    1️⃣ Clone Repository
        git clone <your-repo-url>
        cd project-folder
    2️⃣ Create Virtual Environment
        python -m venv venv
        source venv/bin/activate   # Linux/Mac
        venv\Scripts\activate      # Windows
    3️⃣ Install Dependencies
        pip install -r requirements.txt
    4️⃣ Setup Redis

    Make sure Redis is running on:
    localhost:6379

    5️⃣ Run Backend
        python app.py
    6️⃣ Run Celery Worker
        celery -A app.celery_app worker --loglevel=info
    7️⃣ Run Celery Beat (for scheduled tasks)
        celery -A app.celery_app beat --loglevel=info
    8️⃣ Open Application
        http://localhost:5000

    Default Admin Credentials
    Admin:
    email: admin@gmail.com
    password: 1234



Security Features
    Password hashing
    Token-based authentication
    Role-based authorization
    Secure file upload (PDF only)
    Protected file download routes
Performance Optimizations
    Redis caching for APIs
    Background processing with Celery
    Query optimization with search filters
Future Improvements
    Real-time notifications
    Resume parsing (AI-based)
    Advanced analytics dashboard
    Multi-college support
    Cloud deployment (AWS / Docker)




Author
Jougachar Kherkatary





Conclusion
    This project demonstrates a complete end-to-end placement management system with:
    Full-stack development
    Authentication & authorization
    Background job processing
    REST API design
    Real-world workflow implementation