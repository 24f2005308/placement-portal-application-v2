export default {
    template: `
        <div class="row justify-content-center mt-5 mb-5">
            <div class="col-md-6">
                <div class="card shadow-sm">
                    <div class="card-body p-4">
                        <h3 class="card-title text-center mb-4">Register</h3>
                        <div class="text-center">
                            <div v-if="error" class="alert alert-danger">{{ error }}</div>
                            <div v-if="success" class="alert alert-success">{{ success }}</div>
                        </div>
                        
                        <form @submit.prevent="registerUser">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Register As:</label>
                                <select class="form-select" v-model="role">
                                    <option value="student">Student</option>
                                    <option value="company">Company</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Email address</label>
                                <input type="email" class="form-control" v-model="email" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" v-model="password" required>
                            </div>

                            <div v-if="role === 'student'">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">First Name</label>
                                        <input type="text" class="form-control" v-model="first_name" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Last Name</label>
                                        <input type="text" class="form-control" v-model="last_name" required>
                                    </div>
                                </div>
                            </div>

                            <div v-if="role === 'company'">
                                <div class="mb-3">
                                    <label class="form-label">Company Name</label>
                                    <input type="text" class="form-control" v-model="company_name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">HR Contact (Email or Phone)</label>
                                    <input type="text" class="form-control" v-model="hr_contact" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Website</label>
                                    <input type="text" class="form-control" v-model="website">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Company Description</label>
                                    <textarea class="form-control" v-model="description" rows="2"></textarea>
                                </div>
                            </div>

                            <button type="submit" class="btn btn-success w-100 mt-2">Register</button>
                        </form>
                        
                        <div class="mt-3 text-center">
                            Already have an account? <router-link to="/login">Login here</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            role: 'student',
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            company_name: '',
            hr_contact: '',
            website: '',
            description: '',
            error: null,
            success: null
        }
    },
    methods: {
        async registerUser() {
            this.error = null;
            this.success = null;
            
            const payload = {
                email: this.email,
                password: this.password,
                role: this.role
            };

            if (this.role === 'student') {
                payload.first_name = this.first_name;
                payload.last_name = this.last_name;
            } else {
                payload.company_name = this.company_name;
                payload.hr_contact = this.hr_contact;
                payload.website = this.website;
                payload.description = this.description;
            }

            try {
                const response = await fetch('/user-register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    this.success = data.message + " You can now log in.";
                    this.email = '';
                    this.password = '';
                } else {
                    this.error = data.message || 'Registration failed';
                }
            } catch (err) {
                this.error = 'Something went wrong. Please try again.';
            }
        }
    }
}