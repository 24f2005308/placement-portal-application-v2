export default {
    template: `
        <div>
            <div class="text-center">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
                <div v-if="success" class="alert alert-success">{{ success }}</div>
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-header bg-dark text-white fw-bold">Pending Company Applications: {{pendingCompanies.length}}</div>
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr v-if="pendingCompanies.length !== 0">
                                <th class="col-sr">ID</th>
                                <th class="col-name">Company Name</th>
                                <th class="col-job">Website</th>
                                <th class="col-action pe-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="pendingCompanies.length === 0"><td colspan="3" class="text-center">No pending applications.</td></tr>
                            <tr v-for="comp in pendingCompanies" :key="'pcomp'+comp.id">
                                <td class="col-sr">{{ comp.id }}</td>
                                <td class="col-name">{{ comp.company_name }}</td>
                                <td class="col-job">{{ comp.website }}</td>
                                <td class="col-action">
                                    <button @click="openCompanyModal(comp)" class="btn btn-sm btn-secondary me-2"> View</button>
                                    <button @click="updateCompany(comp.id, {approval_status: 'Approved'})" class="btn btn-sm btn-secondary me-2">Approve</button>
                                    <button @click="updateCompany(comp.id, {approval_status: 'Rejected'})" class="btn btn-sm btn-secondary">Reject</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-header bg-dark text-white fw-bold">Pending Drive Applications: {{pendingDrives.length}}</div>
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr v-if="pendingDrives.length !== 0">
                                <th class="col-sr">ID</th>
                                <th class="col-name">Company Name</th>
                                <th class="col-job">Job Title</th>
                                <th class="col-action pe-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="pendingDrives.length === 0"><td colspan="3" class="text-center">No pending drives.</td></tr>
                            <tr v-for="drive in pendingDrives" :key="'pdrive'+drive.id">
                                <td class="col-sr">{{ drive.id }}</td>
                                <td class="col-name">{{ drive.company_name }}</td>
                                <td class="col-job">{{ drive.job_title }}</td>
                                <td class="col-action">
                                    <button @click="openDriveModal(drive)" class="btn btn-sm btn-secondary me-2">View</button>
                                    <button @click="updateDrive(drive.id, {status: 'Approved'})" class="btn btn-sm btn-secondary me-2">Approve</button>
                                    <button @click="updateDrive(drive.id, {status: 'Rejected'})" class="btn btn-sm btn-secondary">Reject</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-header bg-dark text-white fw-bold d-flex align-items-center gap-3">
    
                    <span style="width: 190px;">Registered Students: {{students.length}}</span>

                    <div class="input-group" style="max-width: 200px;">
                        <input 
                            type="text" 
                            class="form-control form-control-sm" 
                            placeholder="Student..." 
                            v-model="studentSearch" 
                            @keyup.enter="searchStudents"
                        >
                        <button class="btn btn-sm btn-secondary" @click="searchStudents">
                            Search
                        </button>
                    </div>

                </div>
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr v-if="students.length !== 0">
                                <th class="col-sr">ID</th>
                                <th class="col-name">Name</th>
                                <th class="col-status">Status</th>
                                <th class="col-action pe-5">Actions</th>                            
                            </tr>

                        </thead>
                        <tbody>
                            <tr v-if="students.length === 0"><td colspan=\"4\" class=\"text-center\">No students found.</td></tr>
                            <tr v-for="student in students" :key="'std'+student.id">
                                <td class="col-sr">{{ student.id }}</td>
                                <td class="col-name">{{ student.first_name }} {{ student.last_name }}</td>
                                <td class="col-status" style="width: 120px;">
                                    <span class="badge" :class="student.active ? 'bg-success' : 'bg-danger'">
                                        {{ student.active ? 'Active' : 'Blacklisted' }}
                                    </span>
                                </td>
                                <td class="col-action" style="width: 220px">
                                    <button @click="updateStudent(student.id, {active: !student.active})" 
                                            :class="['btn btn-sm me-2', student.active ? 'btn-secondary' : 'btn-secondary']">
                                        {{ student.active ? 'Block' : 'Unblock' }}
                                    </button>
                                    <router-link :to="'/student/' + student.id" class="btn btn-sm btn-secondary">View</router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-header bg-dark text-white fw-bold d-flex align-items-center gap-3">
    
                    <span style="width: 190px;">Registered Companies: {{approvedCompanies.length}}</span>

                    <div class="input-group" style="max-width: 200px;">
                        <input 
                            type="text" 
                            class="form-control form-control-sm" 
                            placeholder="Company..." 
                            v-model="companySearch" 
                            @keyup.enter="searchCompanies"
                        >
                        <button class="btn btn-sm btn-secondary" @click="searchCompanies">
                            Search
                        </button>
                    </div>

                </div>
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr v-if="approvedCompanies.length !== 0">
                                <th class="col-sr">ID</th>
                                <th class="col-name">Company Name</th>
                                <th class="col-status">Status</th>
                                <th class="col-action pe-5">Actions</th>                            
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="approvedCompanies.length === 0"><td colspan=\"4\" class=\"text-center\">No companies found.</td></tr>
                            <tr v-for="comp in approvedCompanies" :key="'acomp'+comp.id">
                                <td class="col-sr">{{ comp.id }}</td>
                                <td class="col-name">{{ comp.company_name }}</td>
                                <td class="col-status" style="width: 120px;">
                                    <span class="badge" :class="comp.active !== false ? 'bg-success' : 'bg-danger'">
                                        {{ comp.active !== false ? 'Active' : 'Blacklisted' }}
                                    </span>
                                </td>
                                <td class="col-action" style="width: 220px">
                                    <button @click="updateCompany(comp.id, {active: comp.active === false ? true : false})" 
                                            :class="['btn btn-sm me-2', comp.active !== false ? 'btn-secondary' : 'btn-secondary']">
                                        {{ comp.active !== false ? 'Block' : 'Unblock' }}
                                    </button>
                                    <button @click="openCompanyModal(comp)" class="btn btn-sm btn-secondary">View</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-header bg-dark text-white fw-bold d-flex align-items-center gap-3">
    
                <span style="width: 190px;">Ongoing Drives: {{ongoingDrives.length}}</span>

                <div class="input-group" style="max-width: 200px;">
                    <input 
                        type="text" 
                        class="form-control form-control-sm" 
                        placeholder="Drive..." 
                        v-model="driveSearch" 
                        @keyup.enter="searchDrives"
                    >
                    <button class="btn btn-sm btn-secondary" @click="searchDrives">
                        Search
                    </button>
                </div>

            </div>
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr v-if="ongoingDrives.length !== 0">
                                <th class="col-sr">Sr No.</th>
                                <th class="col-name">Company Name</th>
                                <th class="col-job">Job Title</th>
                                <th class="col-date">Deadline</th>
                                <th class="col-action pe-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="ongoingDrives.length === 0"><td colspan=\"5\" class=\"text-center\">No drives found.</td></tr>
                            <tr v-for="(drive, index) in ongoingDrives" :key="'odrive'+drive.id">
                                <td class="col-sr">{{ index + 1 }}</td>
                                <td class="col-name">{{ drive.company_name || 'View' }}</td>
                                <td class="col-job">{{ drive.job_title }}</td>
                                <td class="col-date">{{ drive.application_deadline }}</td>
                                <td class="col-action">
                                    <button @click="updateDrive(drive.id, {status: 'Closed'})" class="btn btn-sm btn-secondary me-2">Close</button>
                                    <router-link :to="'/drive/' + drive.id" class="btn btn-sm btn-secondary">View</router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card shadow-sm mb-5">
                <div class="card-header bg-dark text-white fw-bold">Student Applications: {{applications.length}}</div>
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr v-if="applications.length !== 0">
                                <th class="col-sr">Sr No.</th>
                                <th class="col-name">Student Name</th>
                                <th class="col-job">Job Title</th>
                                <th class="col-date">App Date</th>
                                <th class="col-action pe-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="applications.length === 0"><td colspan="5" class="text-center">No applications found.</td></tr>
                            <tr v-for="(app, index) in applications" :key="'app'+app.id">
                                <td class="col-sr">{{ index + 1 }}</td>
                                <td class="col-name">{{ app.student_name }}</td>
                                <td class="col-job">{{ app.job_title }}</td>
                                <td class="col-date">{{ app.application_date }}</td>
                                <td class="col-action pe-5">
                                    <router-link :to="'/student/' + (app.student_id || '')" class="btn btn-sm btn-secondary">View</router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal d-block" style="background: rgba(0,0,0,0.5);" v-if="selectedDrive" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Drive Details</h5>
                            <button type="button" class="btn-close" @click="selectedDrive = null"></button>
                        </div>
                        <div class="modal-body">

                            <p><strong>Job Title:</strong> {{ selectedDrive.job_title }}</p>
                            <p><strong>Deadline:</strong> {{ selectedDrive.application_deadline }}</p>
                            <p><strong>Location:</strong> {{ selectedDrive.job_location }}</p>
                            <p><strong>Salary:</strong> {{ selectedDrive.job_salary }}</p>
                            <p><strong>Description:</strong> {{ selectedDrive.job_description || 'No description provided' }}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="selectedDrive = null">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal d-block" style="background: rgba(0,0,0,0.5);" v-if="selectedCompany" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Company Details</h5>
                            <button type="button" class="btn-close" @click="selectedCompany = null"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Name:</strong> {{ selectedCompany.company_name }}</p>
                            <p><strong>HR Contact:</strong> {{ selectedCompany.hr_contact || 'N/A' }}</p>
                            <p><strong>Website:</strong> {{ selectedCompany.website || 'N/A' }}</p>
                            <p><strong>Description:</strong> {{ selectedCompany.description || 'N/A' }}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="selectedCompany = null">Close</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            isExporting: false,
            studentSearch: '',
            companySearch: '',
            driveSearch: '',
            companies: [],
            students: [],
            drives: [],
            applications: [],
            selectedDrive: null,
            selectedCompany: null,
            error: null,
            success: null,
            token: localStorage.getItem('auth-token')
        }
    },
    computed: {
        pendingCompanies() { return this.companies.filter(c => c.approval_status === 'Pending'); },
        approvedCompanies() { return this.companies.filter(c => c.approval_status === 'Approved'); },
        pendingDrives() { return this.drives.filter(d => d.status === 'Pending'); },
        ongoingDrives() { return this.drives.filter(d => d.status === 'Approved'); }
    },
    async mounted() {
        if (!this.token) { this.$router.push('/login'); return; }
        await this.fetchAllData();
    },
    methods: {
        async fetchAllData() {
            await Promise.all([
                this.searchCompanies(), 
                this.searchStudents(),
                this.searchDrives(),
                this.fetchData('/api/applications', 'applications')
            ]);
        },
        async searchStudents() {
            let url = '/api/students';
            if (this.studentSearch) {
                url += '?search_word=' + encodeURIComponent(this.studentSearch);
            }
            await this.fetchData(url, 'students');
        },
        async searchCompanies() {
            let url = '/api/companies';
            if (this.companySearch) {
                url += '?search_word=' + encodeURIComponent(this.companySearch);
            }
            await this.fetchData(url, 'companies');
        },
        async searchDrives() {
            let url = '/api/drives';
            if (this.driveSearch) {
                url += '?search_word=' + encodeURIComponent(this.driveSearch);
            }
            await this.fetchData(url, 'drives');
        },
        async fetchData(endpoint, targetArray) {
            try {
                const response = await fetch(endpoint, { headers: { 'Authentication-Token': this.token } });
                if (response.ok) this[targetArray] = await response.json();
            } catch (err) { console.error(`Failed to fetch ${endpoint}`); }
        },
        async updateCompany(id, payload) {
            await this.sendPutRequest(`/api/companies/${id}`, payload);
            await this.searchCompanies();
        },
        async updateDrive(id, payload) {
            await this.sendPutRequest(`/api/drives/${id}`, payload);
            await this.searchDrives();
        },
        async updateStudent(id, payload) {
            await this.sendPutRequest(`/api/students/${id}`, payload);
            await this.searchStudents();
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
                if (response.ok) this.success = data.message;
                else this.error = data.message;
            } catch (err) { this.error = "Action failed."; }
        },
        async openDriveModal(drive) {
            try {
                const response = await fetch(`/api/drives/${drive.id}`, { headers: { 'Authentication-Token': this.token } });
                if (response.ok) this.selectedDrive = await response.json();
            } catch (e) { console.error("Could not load drive details"); }
        },
        async openCompanyModal(company) {
            try {
                const response = await fetch(`/api/companies/${company.id}`, { headers: { 'Authentication-Token': this.token } });
                if (response.ok) this.selectedCompany = await response.json();
            } catch (e) { console.error("Could not load company details"); }
        },
        async exportStudents() {
            this.isExporting = true;
            this.error = null;
            this.success = null;

            try {
                const triggerRes = await fetch('/api/admin/export', {
                    method: 'POST',
                    headers: { 'Authentication-Token': this.token }
                });
                
                if (!triggerRes.ok) throw new Error("Failed to start export");
                const { task_id } = await triggerRes.json();
                
                const checkStatus = setInterval(async () => {
                    const statusRes = await fetch(`/api/admin/export/status/${task_id}`, {
                        headers: { 'Authentication-Token': this.token }
                    });
                    const statusData = await statusRes.json();
                    
                    if (statusData.status === 'Ready') {
                        clearInterval(checkStatus);
                        this.isExporting = false;
                        this.success = "Export complete!";
                        
                        try {
                            const downloadRes = await fetch(`/download-export/${statusData.filename}`, {
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