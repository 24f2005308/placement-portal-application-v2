from celery.schedules import crontab

broker_url = "redis://localhost:6379/0"
result_backend = "redis://localhost:6379/1"
timezone = "Asia/Kolkata" 
broker_connection_retry_on_startup = True

beat_schedule = {
    # Deadline Reminder
    'deadline-reminder': {
        'task': 'application.tasks.send_deadline_reminders',
        
        # TESTING
        # 'schedule': crontab(minute='*'), 
        
        # Runs every morning at 8:00 AM instead
        'schedule': crontab(hour=8, minute=0),
    },

    # NEW: Monthly Admin Report
    'monthly-admin-report': {
        'task': 'application.tasks.send_monthly_admin_report',
        
        # TESTING
        # 'schedule': crontab(minute='*'), 

        # Runs on the 1st day of every month at 8:00 AM
        'schedule': crontab(day_of_month='1', hour=8, minute=0),      
    }
}