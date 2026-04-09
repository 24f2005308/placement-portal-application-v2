export default {
    template: `
        <div class="row justify-content-center mt-4 mb-5">
            <div class="col-md-8">
                <div class="card shadow-sm">
                    <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">Create New Placement Drive</h4>
                        <button class="btn btn-sm btn-outline-light" @click="$router.push('/company/dashboard')">Cancel</button>
                    </div>
                    <div class="card-body p-4">
                        <div v-if="error" class="alert alert-danger">{{ error }}</div>
                        
                        <form @submit.prevent="createDrive">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Job Title *</label>
                                    <input type="text" class="form-control" v-model="form.job_title" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Location</label>
                                    <input type="text" class="form-control" v-model="form.job_location">
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Job Description *</label>
                                <textarea class="form-control" v-model="form.job_description" rows="4" required></textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Salary Package (in LPA/₹)</label>
                                    <input type="number" class="form-control" v-model="form.job_salary">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Application Deadline *</label>
                                    <input type="date" class="form-control" v-model="form.application_deadline" required>
                                </div>
                            </div>

                            <h5 class="mb-3 mt-4 border-bottom pb-2">Eligibility Criteria</h5>
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="form-label fw-bold">Required Branch</label>
                                    <input type="text" class="form-control" v-model="form.eligibility_branch" placeholder="e.g. CSE, IT">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label fw-bold">Minimum CGPA</label>
                                    <input type="number" step="0.1" class="form-control" v-model="form.eligibility_cgpa">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label fw-bold">Graduation Year</label>
                                    <input type="number" class="form-control" v-model="form.eligibility_year">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-secondary w-100 btn-lg mt-2">Create</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            form: {
                job_title: '', job_description: '', job_salary: null, job_location: '',
                eligibility_branch: '', eligibility_cgpa: null, eligibility_year: null, application_deadline: ''
            },
            error: null,
            token: localStorage.getItem('auth-token')
        }
    },
    methods: {
        async createDrive() {
            this.error = null;
            try {
                const response = await fetch('/api/drives', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authentication-Token': this.token },
                    body: JSON.stringify(this.form)
                });
                const data = await response.json();
                if (response.ok) {
                    this.$router.push('/company/dashboard');
                } else {
                    this.error = data.message;
                }
            } catch (err) { this.error = "Failed to create drive."; }
        }
    }
}