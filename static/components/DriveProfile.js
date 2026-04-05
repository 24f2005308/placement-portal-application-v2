export default {
    template: `
        <div class="row justify-content-center mt-4">
            <div class="col-md-8">
                <div class="card shadow-sm">
                    <div class="text-center">
                            <div v-if="success" class="alert alert-success">{{ success }}</div>
                            <div v-if="error" class="alert alert-danger">{{ error }}</div>
                        </div>
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">Placement Drive Details</h4>
                        <button class="btn btn-sm btn-outline-light" @click="$router.go(-1)">Back</button>
                    </div>
                    <div class="card-body" v-if="drive">

                        <h2 class="text-center text-primary mb-1">{{ drive.job_title }}</h2>
                        <h5 class="text-center text-muted mb-4">{{ drive.company_name }}</h5>
                        
                        <div class="row mb-2"><div class="col-sm-4 fw-bold">Job Location:</div><div class="col-sm-8">{{ drive.job_location || 'Not specified' }}</div></div>
                        <div class="row mb-2"><div class="col-sm-4 fw-bold">Salary Package:</div><div class="col-sm-8">{{ drive.job_salary ? '₹' + drive.job_salary : 'Not specified' }}</div></div>
                        <div class="row mb-2"><div class="col-sm-4 fw-bold">Deadline:</div><div class="col-sm-8 text-danger fw-bold">{{ drive.application_deadline }}</div></div>
                        <div class="row mb-2"><div class="col-sm-4 fw-bold">Status:</div><div class="col-sm-8"><span class="badge" :class="drive.status === 'Approved' ? 'bg-success' : 'bg-secondary'">{{ drive.status }}</span></div></div>
                        
                        <hr><h5 class="fw-bold">Eligibility Criteria</h5>
                        <ul>
                            <li><strong>Branch:</strong> {{ drive.eligibility_branch || 'Any' }}</li>
                            <li><strong>Minimum CGPA:</strong> {{ drive.eligibility_cgpa || 'None' }}</li>
                            <li><strong>Graduation Year:</strong> {{ drive.eligibility_year || 'Any' }}</li>
                        </ul>
                        <hr><h5 class="fw-bold">Job Description</h5>
                        <p style="white-space: pre-line">{{ drive.job_description }}</p>

                        <div class="text-center mt-4" v-if="userRole === 'student'">
                            <button v-if="hasApplied" class="btn btn-secondary btn-lg px-5" disabled>Applied</button>
                            <button v-else class="btn btn-success btn-lg px-5" @click="applyForDrive">Apply Now</button>
                        </div>
                    </div>
                    <div class="card-body text-center" v-else><p>Loading drive data...</p></div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            driveId: this.$route.params.id,
            drive: null,
            hasApplied: false,
            success: null,
            error: null,
            token: localStorage.getItem('auth-token'),
            userRole: localStorage.getItem('role'),
            userId: localStorage.getItem('user_id')
        }
    },
    async mounted() {
        await this.loadDriveData();
        if (this.userRole === 'student') await this.checkIfApplied();
    },
    methods: {
        async loadDriveData() {
            try {
                const res = await fetch(`/api/drives/${this.driveId}`, { headers: { 'Authentication-Token': this.token } });
                if (res.ok) this.drive = await res.json();
            } catch (err) { console.error("Error fetching drive profile"); }
        },
        async checkIfApplied() {
            try {
                // First get the student's ID
                const sRes = await fetch('/api/students', { headers: { 'Authentication-Token': this.token } });
                const students = await sRes.json();
                const me = students.find(s => String(s.user_id) === String(this.userId));
                
                if (me) {
                    // Check if this student has applied for this drive
                    const aRes = await fetch('/api/applications', { headers: { 'Authentication-Token': this.token } });
                    const apps = await aRes.json();
                    this.hasApplied = apps.some(a => String(a.student_id) === String(me.id) && String(a.drive_id) === String(this.driveId));
                }
            } catch (err) { console.error("Could not check application status"); }
        },
        async applyForDrive() {
            this.error = null; this.success = null;
            try {
                const res = await fetch('/api/applications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authentication-Token': this.token },
                    body: JSON.stringify({ drive_id: parseInt(this.driveId) })
                });
                const data = await res.json();
                if (res.ok) {
                    this.hasApplied = true;
                    this.success = "Application submitted successfully!";
                } else this.error = data.message;
            } catch (err) { this.error = "Application failed."; }
        }
    }
}