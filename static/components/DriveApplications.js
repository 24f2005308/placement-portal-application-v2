export default {
    template: `
        <div class="row justify-content-center mt-4 mb-5">
            <div class="col-md-10">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2>Drive Applications</h2>
                    <button class="btn btn-secondary" @click="$router.push('/company/dashboard')">Back to Dashboard</button>
                </div>

                <div class="card shadow-sm mb-4 border-info" v-if="drive">
                    <div class="card-body bg-light">
                        <div class="row">
                            <div class="col-md-4 mb-2"><strong>Company Name:</strong> {{ drive.company_name }}</div>
                            <div class="col-md-4 mb-2"><strong>Drive Title:</strong> {{ drive.job_title }}</div>
                            <div class="col-md-4 mb-2"><strong>Location:</strong> {{ drive.job_location || 'N/A' }}</div>
                            <div class="col-md-4 mb-2"><strong>Deadline:</strong> {{ drive.application_deadline }}</div>
                            <div class="col-md-4 mb-2"><strong>Status:</strong> <span class="badge bg-success">{{ drive.status }}</span></div>
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm">
                    <div class="card-header bg-dark text-white fw-bold">Applicant List: {{applicants.length}} Application</div>
                    <div class="card-body p-0">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Sr No.</th>
                                    <th>Student Name</th>
                                    <th>Application Date</th>
                                    <th>Current Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="applicants.length === 0">
                                    <td colspan="5" class="text-center py-4 text-muted">No students have applied for this drive yet.</td>
                                </tr>
                                <tr v-for="(app, index) in applicants" :key="app.id">
                                    <td>{{ index + 1 }}</td>
                                    <td class="fw-bold">{{ app.student_name }}</td>
                                    <td>{{ app.application_date }}</td>
                                    <td>
                                        <span class="badge" 
                                            :class="{
                                                'bg-secondary': app.status === 'Applied', 
                                                'bg-info text-dark': app.status === 'Shortlisted', 
                                                'bg-success': app.status === 'Selected', 
                                                'bg-danger': app.status === 'Rejected'
                                            }">
                                            {{ app.status }}
                                        </span>
                                    </td>
                                    <td>
                                        <router-link :to="'/student/' + app.student_id" class="btn btn-sm btn-secondary me-2">View</router-link>
                                        <button @click="openActionModal(app)" class="btn btn-sm btn-secondary">Take Action</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="modal d-block" style="background: rgba(0,0,0,0.5);" v-if="showActionModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-light">
                            <h5 class="modal-title">Update Application Status</h5>
                            <button type="button" class="btn-close" @click="closeActionModal"></button>
                        </div>
                        <div class="modal-body">
                            <div v-if="modalError" class="alert alert-danger p-2">{{ modalError }}</div>
                            
                            <p>Taking action for: <strong class="text-primary">{{ selectedApp?.student_name }}</strong></p>
                            
                            <div class="mb-3">
                                <label class="fw-bold form-label">Action / Decision</label>
                                <select class="form-select" v-model="actionForm.selection">
                                    <option value="" disabled>Select an action...</option>
                                    <option value="Shortlist">Shortlist</option>
                                    <option value="Select">Select</option>
                                    <option value="Reject">Reject</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold form-label">Remark (Optional)</label>
                                <textarea class="form-control" v-model="actionForm.remark" rows="3" placeholder="Add feedback, next steps, or notes here..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="closeActionModal">Cancel</button>
                            <button type="button" class="btn btn-secondary" @click="saveAction" :disabled="!actionForm.selection">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            driveId: this.$route.params.id,
            drive: null,
            allApplications: [],
            token: localStorage.getItem('auth-token'),
            
            // Modal State properties
            showActionModal: false,
            selectedApp: null,
            actionForm: {
                selection: '',
                remark: ''
            },
            modalError: null
        }
    },
    computed: {
        applicants() {
            // Filter to show ONLY applications for this specific drive
            return this.allApplications.filter(app => String(app.drive_id) === String(this.driveId));
        }
    },
    async mounted() {
        if (!this.token) { this.$router.push('/login'); return; }
        await this.fetchDriveAndApps();
    },
    methods: {
        async fetchDriveAndApps() {
            try {
                // Fetch Drive Details
                const driveRes = await fetch(`/api/drives/${this.driveId}`, { headers: { 'Authentication-Token': this.token } });
                if (driveRes.ok) this.drive = await driveRes.json();
                
                // Fetch All Applications
                const appRes = await fetch('/api/applications', { headers: { 'Authentication-Token': this.token } });
                if (appRes.ok) this.allApplications = await appRes.json();
            } catch (err) { 
                console.error("Error loading drive applications."); 
            }
        },
        openActionModal(app) {
            this.selectedApp = app;
            this.actionForm = {
                selection: '', // Reset dropdown so they have to pick one
                remark: app.remark || '' // Pre-fill existing remark if it exists
            };
            this.modalError = null;
            this.showActionModal = true;
        },
        closeActionModal() {
            this.showActionModal = false;
            this.selectedApp = null;
        },
        async saveAction() {
            this.modalError = null;
            
            // Map the dropdown selection to the final database status
            const statusMapping = {
                'Shortlist': 'Shortlisted',
                'Select': 'Selected',
                'Reject': 'Rejected'
            };
            
            const payload = {
                status: statusMapping[this.actionForm.selection],
                remark: this.actionForm.remark
            };

            try {
                const res = await fetch(`/api/applications/${this.selectedApp.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token 
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    await this.fetchDriveAndApps(); // Refresh the list to show new status
                    this.closeActionModal();
                } else {
                    this.modalError = data.message || "Failed to update application.";
                }
            } catch (err) {
                this.modalError = "A network error occurred. Please try again.";
            }
        }
    }
}