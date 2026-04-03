export default {
    template: `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div class="container-fluid">
                <router-link class="navbar-brand fw-bold" to="/">Placement Portal</router-link>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        
                        <li class="nav-item" v-if="!isLoggedIn">
                            <router-link class="nav-link" to="/login">Login</router-link>
                        </li>
                        <li class="nav-item" v-if="!isLoggedIn">
                            <router-link class="nav-link" to="/register">Register</router-link>
                        </li>
                        
                        <li class="nav-item" v-if="isLoggedIn">
                            <router-link class="nav-link" :to="dashboardLink">Dashboard</router-link>
                        </li>









                        <!-- ADMIN -->
                        <li v-if="role === 'admin'" class="nav-item">
                            <a class="nav-link" href="#" @click="triggerAdminExport">Export Record CSV</a>
                        </li>

                        <!-- COMPANY -->
                        <li v-if="role === 'company'" class="nav-item">
                            <router-link class="nav-link" to="/create-drive">Create Drive</router-link>
                        </li>

                        <!-- STUDENT -->
                        <li v-if="role === 'student'" class="nav-item">
                            <router-link class="nav-link" to="/student-history">History</router-link>
                        </li>

                        <li v-if="role === 'student'" class="nav-item">
                            <a class="nav-link" href="#" @click="triggerEditProfile">Edit Profile</a>
                        </li>













                        <li class="nav-item" v-if="isLoggedIn">
                            <a class="nav-link text-danger" href="#" @click.prevent="logoutUser">Logout</a>
                        </li>
                        
                    </ul>
                </div>
            </div>
        </nav>
    `,
    data() {
        return {
            isLoggedIn: !!localStorage.getItem('auth-token'),
            role: localStorage.getItem('role')
        }
    },
    computed: {
        dashboardLink() {
            if (this.role === 'admin') return '/admin/dashboard';
            if (this.role === 'company') return '/company/dashboard';
            if (this.role === 'student') return '/student/dashboard';
            return '/';
        }
    },
    methods: {
        async logoutUser() {
            const token = localStorage.getItem('auth-token');
            
            if (token) {
                try {
                    await fetch('/user-logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication-Token': token
                        }
                    });
                } catch(e) {
                    console.error("Backend logout issue, clearing local storage anyway.");
                }
            }

            localStorage.removeItem('auth-token');
            localStorage.removeItem('role');
            
            this.isLoggedIn = false;
            this.role = null;
            
            if (this.$route.path !== '/login') {
                this.$router.push('/login');
            }
        },
        triggerAdminExport() {
        window.dispatchEvent(new Event('export-students'));
        },
        triggerReport() {
            window.dispatchEvent(new Event('student-report'));
        },
        triggerEditProfile() {
            window.dispatchEvent(new Event('edit-profile'));
        }
    },
    watch: {
        $route(to, from) {
            this.isLoggedIn = !!localStorage.getItem('auth-token');
            this.role = localStorage.getItem('role');
        }
    }
}