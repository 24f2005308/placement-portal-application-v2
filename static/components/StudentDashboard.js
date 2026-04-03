export default {
    template: `
        <div>
            <div class="text-center">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
                <div v-if="success" class="alert alert-success">{{ success }}</div>
            </div>

            <div class="card shadow-sm mb-5">
                <div class="card-header bg-dark text-white fw-bold d-flex align-items-center gap-3">
                    <span>1. Organizations</span>
                    <div class="input-group" style="max-width: 200px;">
                        <input type="text" class="form-control form-control-sm" placeholder="Companies..." v-model="companySearch" @keyup.enter="fetchAllData">
                        <button class="btn btn-sm btn-secondary" @click="fetchAllData">Search</button>
                    </div>
                </div>
                
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr v-if="approvedCompanies.length !== 0">
                                <th class="col-sr">Sr No.</th>
                                <th class="col-name">Company Name</th>
                                <th class="col-action pe-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="approvedCompanies.length === 0"><td colspan="3" class="text-center">No companies found.</td></tr>
                            <tr v-for="(comp, index) in approvedCompanies" :key="'comp'+comp.id">
                                <td class="col-sr">{{ index + 1 }}</td>
                                <td class="col-name">{{ comp.company_name }}</td>
                                <td class="col-action pe-4">
                                    <router-link :to="'/company-drives/' + comp.id" class="btn btn-sm btn-secondary">View Drives</router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card shadow-sm mb-5">
                <div class="card-header bg-dark text-white fw-bold">2. Applied Drives</div>
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr v-if="myApplications.length !== 0">
                                <th class="col-sr">Sr No.</th>
                                <th class="col-name">Company Name</th>
                                <th class="col-job">Job Title</th>
                                <th class="col-date">App Date</th>
                                <th class="col-status">Status</th>
                                <th class="col-remark">Remark</th>
                                <th class="col-action pe-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="myApplications.length === 0"><td colspan="7" class="text-center">You have not applied to any drives yet.</td></tr>
                            <tr v-for="(app, index) in myApplications" :key="'app'+app.id">
                                <td class="col-sr">{{ index + 1 }}</td>
                                <td class="col-name">{{ app.company_name }}</td>
                                <td class="col-job">{{ app.job_title }}</td>
                                <td class="col-date">{{ app.application_date }}</td>
                                <td class="col-status"><span class="badge bg-secondary">{{ app.status }}</span></td>
                                <td class="col-remark">{{ app.remark || '-' }}</td>
                                <td class="col-action pe-5">
                                    <router-link :to="'/drive/' + app.drive_id" class="btn btn-sm btn-secondary">View</router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal d-block" style="background: rgba(0,0,0,0.5);" v-if="showEditModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-light">
                            <h5 class="modal-title">Edit Profile</h5>
                            <button type="button" class="btn-close" @click="showEditModal = false"></button>
                        </div>
                        <div class="modal-body">
                            <div v-if="modalError" class="alert alert-danger p-2">{{ modalError }}</div>
                            <div v-if="modalSuccess" class="alert alert-success p-2">{{ modalSuccess }}</div>
                            
                            <form @submit.prevent="saveProfile">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="fw-bold">First Name</label>
                                        <input type="text" class="form-control" v-model="profileForm.first_name" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="fw-bold">Last Name</label>
                                        <input type="text" class="form-control" v-model="profileForm.last_name" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="fw-bold">Branch</label>
                                        <input type="text" class="form-control" v-model="profileForm.branch">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="fw-bold">CGPA</label>
                                        <input type="number" step="0.1" class="form-control" v-model="profileForm.cgpa">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="fw-bold">Graduation Year</label>
                                        <input type="number" class="form-control" v-model="profileForm.graduation_year">
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-secondary w-100 mb-4">Save</button>
                            </form>

                            <hr>
                            <h6 class="fw-bold mb-3">Resume Upload</h6>
                            <div class="mb-3">
                                <div class="input-group">
                                    <input type="file" class="form-control" @change="handleFileUpload" accept="application/pdf">
                                    <button class="btn btn-secondary" @click="uploadResume" :disabled="!selectedFile">
                                        Upload
                                    </button>
                                </div>

                                <small v-if="profileForm.resume_file" class="text-success mt-1 d-block">
                                    Current: {{ profileForm.resume_file }}
                                </small>
                                <button 
                                    v-if="profileForm.resume_file" 
                                    @click="viewResume(profileForm.resume_file)" 
                                    class="btn btn-sm btn-outline-primary mt-2"
                                >
                                    View Resume
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            companySearch: '',
            companies: [],
            applications: [],
            myStudentId: null,
            showEditModal: false,
            profileForm: {},
            selectedFile: null,
            error: null,
            success: null,
            modalError: null,
            modalSuccess: null,
            token: localStorage.getItem('auth-token'),
            userId: localStorage.getItem('user_id')
        }
    },
    computed: {
        approvedCompanies() { return this.companies.filter(c => c.approval_status === 'Approved'); },
        myApplications() { return this.applications.filter(a => String(a.student_id) === String(this.myStudentId)); }
    },
    async mounted() {
        if (!this.token) { this.$router.push('/login'); return; }
        window.addEventListener('student-report', this.requestReport);
        window.addEventListener('edit-profile', this.openEditModal);
        await this.identifyStudent();
        await this.fetchAllData();
    },
    methods: {
        async identifyStudent() {
            try {
                const res = await fetch('/api/students', { headers: { 'Authentication-Token': this.token } });
                const allStudents = await res.json();
                const me = allStudents.find(s => String(s.user_id) === String(this.userId));
                if (me) this.myStudentId = me.id;
            } catch(e) { console.error("Could not identify student"); }
        },
        async fetchAllData() {
            try {
                const compRes = await fetch('/api/companies?search_word=' + this.companySearch, { headers: { 'Authentication-Token': this.token } });                if(compRes.ok) this.companies = await compRes.json();

                const appRes = await fetch('/api/applications', { headers: { 'Authentication-Token': this.token } });
                if(appRes.ok) this.applications = await appRes.json();
            } catch(e) { this.error = "Error fetching dashboard data."; }
        },
        async openEditModal() {
            try {
                const res = await fetch(`/api/students/${this.myStudentId}`, { headers: { 'Authentication-Token': this.token } });
                if(res.ok) {
                    this.profileForm = await res.json();
                    this.showEditModal = true;
                    this.modalError = null; this.modalSuccess = null;
                }
            } catch(e) { this.error = "Could not load profile data."; }
        },
        async saveProfile() {
            this.modalError = null; this.modalSuccess = null;
            try {
                const res = await fetch(`/api/students/${this.myStudentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authentication-Token': this.token },
                    body: JSON.stringify({
                        first_name: this.profileForm.first_name, last_name: this.profileForm.last_name,
                        branch: this.profileForm.branch, cgpa: this.profileForm.cgpa, graduation_year: this.profileForm.graduation_year
                    })
                });
                const data = await res.json();
                if(res.ok) this.modalSuccess = "Profile updated!";
                else this.modalError = data.message;
            } catch(e) { this.modalError = "Update failed."; }
        },
        handleFileUpload(event) {
            this.selectedFile = event.target.files[0];
        },
        async uploadResume() {
            if(!this.selectedFile) return;
            this.modalError = null; this.modalSuccess = null;
            
            const formData = new FormData();
            formData.append('file', this.selectedFile);

            try {
                const res = await fetch('/upload-resume', {
                    method: 'POST',
                    headers: { 'Authentication-Token': this.token }, // Do NOT set Content-Type for FormData
                    body: formData
                });
                const data = await res.json();
                if(res.ok) {
                    this.modalSuccess = "Resume uploaded securely!";
                    this.selectedFile = null;
                } else this.modalError = data.message;
            } catch(e) { this.modalError = "Upload failed."; }
        },
        async requestReport() {
            this.error = null;
            this.success = null;
            try {
                const res = await fetch('/trigger-report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    this.success = data.message;
                } else {
                    this.error = data.message;
                }
            } catch (err) {
                this.error = "Failed to request report. Ensure the server is running.";
            }
        },
        async viewResume(filename) {
            try {
                const response = await fetch(`/download-resume/${filename}`, {
                    method: 'GET',
                    headers: { 'Authentication-Token': this.token }
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const fileUrl = window.URL.createObjectURL(blob);
                    window.open(fileUrl, '_blank');
                    setTimeout(() => window.URL.revokeObjectURL(fileUrl), 1000);
                } else {
                    this.modalError = "Failed to load resume.";
                }
            } catch (err) {
                this.modalError = "Error opening resume.";
            }
        },
        beforeDestroy() {
            window.removeEventListener('student-report', this.requestReport);
            window.removeEventListener('edit-profile', this.openEditModal);
        }
    }
}