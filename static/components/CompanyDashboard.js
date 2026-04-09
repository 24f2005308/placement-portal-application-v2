export default {
    template: `
        <div>
            <div class="text-center">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
                <div v-if="success" class="alert alert-success">{{ success }}</div>
            </div>
            <div class="card shadow-sm mb-5">

                <div class="card-header bg-dark text-white fw-bold d-flex align-items-center gap-3">
    
                    <span>Drives</span>

                    <div class="input-group" style="max-width: 200px;">
                        <input 
                            type="text" 
                            class="form-control form-control-sm" 
                            placeholder="Title..." 
                            v-model="driveSearch" 
                            @keyup.enter="fetchDrives"
                        >
                        <button class="btn btn-sm btn-secondary" @click="fetchDrives">
                            Search
                        </button>
                    </div>

                </div>
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light"><tr v-if="activeDrives.length !== 0"><th>Sr No.</th><th>Drive Title</th><th>Date (Deadline)</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            <tr v-if="activeDrives.length === 0"><td colspan="5" class="text-center">No active drives found.</td></tr>
                            <tr v-for="(drive, index) in activeDrives" :key="'active'+drive.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ drive.job_title }}</td>
                                <td>{{ drive.application_deadline }}</td>
                                <td>
                                    <span class="badge" 
                                        :class="{'bg-warning text-dark': drive.status === 'Pending', 'bg-success': drive.status === 'Approved', 'bg-danger': drive.status === 'Rejected'}">
                                        {{ drive.status }}
                                    </span>
                                </td>
                                <td>
                                    <button v-if="drive.status === 'Pending'" @click="openEditModal(drive)" class="btn btn-sm btn-secondary">Edit Drive</button>
                                    
                                    <template v-if="drive.status === 'Approved'">
                                        <router-link :to="'/drive-applications/' + drive.id" class="btn btn-sm btn-secondary">View</router-link>
                                        <button @click="updateDriveStatus(drive.id, 'Closed')" class="btn btn-sm btn-secondary">Complete</button>
                                    </template>
                                    
                                    <button v-if="drive.status === 'Rejected'" @click="openEditModal(drive)" class="btn btn-sm btn-warning">Resubmit</button>
                                    <button 
                                        v-if="drive.status === 'Pending'"
                                        @click="deleteDrive(drive.id)" 
                                        class="btn btn-sm btn-secondary ms-2">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card shadow-sm mb-5">
                <div class="card-header bg-dark text-white fw-bold">Closed Drives</div>
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light"><tr v-if="closedDrives.length !== 0"><th>Sr No.</th><th>Drive Title</th><th>Date (Deadline)</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            <tr v-if="closedDrives.length === 0"><td colspan="5" class="text-center">No closed drives.</td></tr>
                            <tr v-for="(drive, index) in closedDrives" :key="'closed'+drive.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ drive.job_title }}</td>
                                <td>{{ drive.application_deadline }}</td>
                                <td><span class="badge bg-dark">Closed</span></td>
                                <td>
                                    <button @click="openExtendModal(drive)" class="btn btn-sm btn-secondary">Extend Deadline</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal d-block" style="background: rgba(0,0,0,0.5);" v-if="editingDrive" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-light">
                            <h5 class="modal-title">{{ editingDrive.status === 'Rejected' ? 'Resubmit Drive' : 'Edit Drive' }}</h5>
                            <button type="button" class="btn-close" @click="editingDrive = null"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="fw-bold">Job Title</label>
                                <input type="text" class="form-control" v-model="editForm.job_title">
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Job Description</label>
                                <textarea class="form-control" v-model="editForm.job_description" rows="3"></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="fw-bold">Location</label>
                                    <input type="text" class="form-control" v-model="editForm.job_location">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="fw-bold">Deadline</label>
                                    <input type="date" class="form-control" v-model="editForm.application_deadline">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="editingDrive = null">Cancel</button>
                            <button type="button" class="btn btn-secondary" @click="saveEdit">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal d-block" style="background: rgba(0,0,0,0.5);" v-if="extendingDrive" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-light">
                            <h5 class="modal-title">Extend Deadline</h5>
                            <button type="button" class="btn-close" @click="extendingDrive = null"></button>
                        </div>
                        <div class="modal-body">
                            <p>Select a new deadline for <strong>{{ extendingDrive.job_title }}</strong>.</p>
                            <label class="fw-bold">New Deadline Date</label>
                            <input type="date" class="form-control" v-model="newDeadline">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="extendingDrive = null">Cancel</button>
                            <button type="button" class="btn btn-success" @click="saveExtension">Save</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            driveSearch: '',
            drives: [],
            editingDrive: null,
            editForm: {},
            extendingDrive: null,
            newDeadline: '',
            error: null,
            success: null,
            token: localStorage.getItem('auth-token')
        }
    },
    computed: {
        activeDrives() { return this.drives.filter(d => ['Pending', 'Approved', 'Rejected'].includes(d.status)); },
        closedDrives() { return this.drives.filter(d => d.status === 'Closed'); }
    },
    async mounted() {
        if (!this.token) { this.$router.push('/login'); return; }
        await this.fetchDrives();
    },
    methods: {
        // FIX: Appending the search_word parameter dynamically to the URL
        async fetchDrives() {
            try {
                let url = '/api/drives';
                if (this.driveSearch) {
                    url += '?search_word=' + encodeURIComponent(this.driveSearch);
                }
                const response = await fetch(url, { headers: { 'Authentication-Token': this.token } });
                if (response.ok) this.drives = await response.json();
            } catch (err) { this.error = "Failed to load drives."; }
        },
        async updateDriveStatus(id, newStatus) {
            await this.sendPutRequest(`/api/drives/${id}`, { status: newStatus });
        },
        async openEditModal(drive) {
            try {
                const response = await fetch(`/api/drives/${drive.id}`, { headers: { 'Authentication-Token': this.token } });
                if (response.ok) {
                    this.editForm = await response.json();
                    this.editingDrive = drive;
                }
            } catch (e) { this.error = "Could not load drive details."; }
        },
        async saveEdit() {
            const payload = {
                job_title: this.editForm.job_title,
                job_description: this.editForm.job_description,
                job_location: this.editForm.job_location,
                application_deadline: this.editForm.application_deadline
            };
            if (this.editingDrive.status === 'Rejected') {
                payload.status = 'Pending';
            }
            await this.sendPutRequest(`/api/drives/${this.editingDrive.id}`, payload);
            this.editingDrive = null;
        },
        async deleteDrive(id) {
            if (!confirm("Are you sure you want to delete this drive?")) return;

            this.error = null;
            this.success = null;

            try {
                const response = await fetch(`/api/drives/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authentication-Token': this.token
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    this.success = data.message;
                    await this.fetchDrives(); // refresh list
                } else {
                    this.error = data.message;
                }
            } catch (err) {
                this.error = "Delete failed.";
            }
        },
        openExtendModal(drive) {
            this.extendingDrive = drive;
            this.newDeadline = drive.application_deadline;
        },
        async saveExtension() {
            if (!this.newDeadline) return;
            await this.sendPutRequest(`/api/drives/${this.extendingDrive.id}`, { 
                application_deadline: this.newDeadline, 
                status: 'Approved' 
            });
            this.extendingDrive = null;
        },
        async sendPutRequest(url, payload) {
            this.error = null; this.success = null;
            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authentication-Token': this.token },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (response.ok) {
                    this.success = data.message || "Update successful";
                    await this.fetchDrives();
                } else this.error = data.message;
            } catch (err) { this.error = "Action failed."; }
        }
    }
}