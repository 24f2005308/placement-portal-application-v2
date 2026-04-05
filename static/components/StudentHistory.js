export default {
    template: `
        <div class="row justify-content-center mt-4 mb-5">
            <div class="col-md-10">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2>Application History</h2>
                    <router-link to="/student/dashboard" class="btn btn-secondary">Back to Dashboard</router-link>
                </div>
                <button class="btn btn-secondary mb-3" @click="exportHistory" :disabled="isExporting">
                    {{ isExporting ? 'Generating CSV...' : 'Export History to CSV' }}
                </button>

                <div v-if="error" class="alert alert-danger">{{ error }}</div>
                <div v-if="success" class="alert alert-success">{{ success }}</div>

                <div class="card shadow-sm mb-4" v-if="student">
                    <div class="card-body bg-light">
                        <h4 class="text-primary">{{ student.first_name }} {{ student.last_name }}</h4>
                        <div class="row mt-2">
                            <div class="col-md-4"><strong>Branch:</strong> {{ student.branch || 'N/A' }}</div>
                            <div class="col-md-4"><strong>CGPA:</strong> {{ student.cgpa || 'N/A' }}</div>
                            <div class="col-md-4"><strong>Graduation Year:</strong> {{ student.graduation_year || 'N/A' }}</div>
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm border-secondary">
                    <div class="card-header bg-secondary text-white fw-bold">Full Application History</div>
                    <div class="card-body p-0">
                        <table class="table table-hover mb-0">
                            <thead class="table-light"><tr v-if="myHistory.length !== 0"><th class="col-sr">Sr No.</th><th class="col-date">Date</th><th class="col-name">Company</th><th class="col-job">Job Title</th><th class="col-status">Status</th><th class="col-remark">Remark</th></tr></thead>
                            <tbody>
                                <tr v-if="myHistory.length === 0"><td colspan="7" class="text-center">No history found.</td></tr>
                                <tr v-for="(app, index) in myHistory" :key="'hist'+app.id">
                                    <td class="col-sr">{{ index + 1 }}</td>
                                    <td class="col-date">{{ app.application_date }}</td>
                                    <td class="col-name">{{ app.company_name }}</td>
                                    <td class="col-job">{{ app.job_title }}</td>
                                    <td class="col-status">{{ app.status }}</td>
                                    <td class="col-remark">{{ app.remark || '-' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            student: null,
            allApplications: [],
            myStudentId: null,
            token: localStorage.getItem('auth-token'),
            userId: localStorage.getItem('user_id'),
            isExporting: false,
            error: null,
            success: null,
        }
    },
    computed: {
        myHistory() { return this.allApplications.filter(a => String(a.student_id) === String(this.myStudentId)); }
    },
    async mounted() {
        if (!this.token) { this.$router.push('/login'); return; }
        await this.loadData();
    },
    methods: {
        async loadData() {
            try {
                const res = await fetch('/api/students', { headers: { 'Authentication-Token': this.token } });
                const students = await res.json();
                const me = students.find(s => String(s.user_id) === String(this.userId));
                
                if (me) {
                    this.myStudentId = me.id;
                    const profileRes = await fetch(`/api/students/${me.id}`, { headers: { 'Authentication-Token': this.token } });
                    if(profileRes.ok) this.student = await profileRes.json();
                    
                    const appRes = await fetch('/api/applications', { headers: { 'Authentication-Token': this.token } });
                    if(appRes.ok) this.allApplications = await appRes.json();
                }
            } catch(e) { console.error("Could not load history"); }
        },
        // FIX: exportHistory is now safely inside the methods object!
        async exportHistory() {
            this.isExporting = true;
            this.error = null;
            this.success = null;

            try {
                // 1. Trigger the background task
                const triggerRes = await fetch('/api/student/export', {
                    method: 'POST',
                    headers: { 'Authentication-Token': this.token }
                });
                
                if (!triggerRes.ok) throw new Error("Failed to start export");
                const { task_id } = await triggerRes.json();
                
                // 2. Poll the status endpoint every 2 seconds
                const checkStatus = setInterval(async () => {
                    const statusRes = await fetch(`/api/student/export/status/${task_id}`, {
                        headers: { 'Authentication-Token': this.token }
                    });
                    const statusData = await statusRes.json();
                    
                    if (statusData.status === 'Ready') {
                        clearInterval(checkStatus);
                        this.isExporting = false;
                        this.success = "Export complete! Check your email for the alert.";
                        
                        // 3. Trigger Secure Blob Download
                        try {
                            const downloadRes = await fetch(`/download-student-export/${statusData.filename}`, {
                                method: 'GET',
                                headers: { 'Authentication-Token': this.token }
                            });
                            
                            if (downloadRes.ok) {
                                const blob = await downloadRes.blob();
                                const downloadUrl = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.style.display = 'none';
                                a.href = downloadUrl;
                                a.download = statusData.filename;
                                document.body.appendChild(a);
                                a.click(); 
                                window.URL.revokeObjectURL(downloadUrl); 
                                a.remove(); 
                            } else {
                                this.success = null;
                                this.error = "File generated, but failed to download securely.";
                            }
                        } catch (downloadErr) {
                            this.error = "Network error during file download.";
                        }

                    } else if (statusData.status === 'Failed') {
                        clearInterval(checkStatus);
                        this.isExporting = false;
                        this.error = "Export failed during processing.";
                    }
                }, 2000); 

            } catch (err) {
                this.isExporting = false;
                this.error = "Could not initiate export.";
            }
        }
    }
}