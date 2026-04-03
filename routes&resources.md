List of Endpoints in routes.py (Standard Routing & Authentication)

    => /user-login (POST): Authenticates a user (Admin, Company, or Student) and returns an auth token/session.

    => /user-register (POSST): Handles new user registrations, determining role (Company or Student) and creating the respective profile in the database.

    => /user-logout (POST): Invalidates the user session/token.

    => /download-resume/<filename> (GET): Serves the uploaded PDF resume files securely.

    => /trigger-export (POST): Triggers the async Celery batch job for a student to export their application history as a CSV.

    => /download-csv/<task_id> (GET): Allows the student to download the generated CSV file once the async job is complete.











List of API Classes in resources.py (Flask-RESTful Resources)

    AdminDashboardResource

    => /api/admin/dashboard (GET): Returns aggregate statistics (total students, total companies, total placement drives).
    
    CompanyResource

    => /api/companies (GET): Returns a list of companies (Admin can see all, with filtering for pending/approved).

    => /api/companies/<int:id> (GET): Returns a specific company's profile.

    => /api/companies/<int:id> (PUT): Updates company status (Admin approves/rejects/blacklists) or updates profile details (Company updates own profile).



    StudentResource

    => /api/students (GET): Returns a list of all students (Admin view).

    => /api/students/<int:id> (GET): Returns a specific student's profile.

    => /api/students/<int:id> (PUT): Updates student status (Admin blacklists/deactivates) or updates profile details/resume (Student updates own profile).



    PlacementDriveResource

    => /api/drives (GET): Returns a list of placement drives (Admin sees all, Students see only approved, Companies see their own).

    => /api/drives/<int:id> (GET): Returns details of a specific placement drive.

    => /api/drives (POST): Creates a new placement drive (Company only).

    => /api/drives/<int:id> (PUT): Updates a placement drive (Admin approves/rejects, Company edits details before approval).



    ApplicationResource

    => /api/applications (GET): Returns a list of applications (Admin sees all, Company sees applications for their drives, Student sees their own history).

    => /api/applications/<int:id> (GET): Returns a specific application's details.

    => /api/applications (POST): Creates a new application (Student applies to an approved drive).

    => /api/applications/<int:id> (PUT): Updates application status, interview type, or remarks (Company only).