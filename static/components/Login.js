export default {
    template: `
        <div class="row justify-content-center mt-5">
            <div class="col-md-5">
                <div class="card shadow-sm">
                    <div class="card-body p-4">
                        <h3 class="card-title text-center mb-4">Login</h3>
                        
                        <div v-if="error" class="alert alert-danger" role="alert">
                            {{ error }}
                        </div>

                        <form @submit.prevent="loginUser">
                            <div class="mb-3">
                                <label class="form-label">Email address</label>
                                <input type="email" class="form-control" v-model="email" required>
                            </div>
                            <div class="mb-4">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" v-model="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Login</button>
                        </form>
                        
                        <div class="mt-3 text-center">
                            Don't have an account? <router-link to="/register">Register here</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            error: null
        }
    },
    methods: {
        async loginUser() {
            this.error = null;
            try {
                const response = await fetch('/user-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Save token and role to local storage
                    localStorage.setItem('auth-token', data.token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('user_id', data.user_id);
                    
                    // Route to the appropriate dashboard based on role
                    if (data.role === 'admin') {
                        this.$router.push('/admin/dashboard');
                    } else if (data.role === 'company') {
                        this.$router.push('/company/dashboard');
                    } else if (data.role === 'student') {
                        this.$router.push('/student/dashboard');
                    }
                } else {
                    this.error = data.message || 'Invalid credentials';
                }
            } catch (err) {
                this.error = 'Something went wrong. Please try again.';
            }
        }
    }
}