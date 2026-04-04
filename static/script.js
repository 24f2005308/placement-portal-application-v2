import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Navbar from './components/Navbar.js';
import AdminDashboard from './components/AdminDashboard.js';
import StudentDashboard from './components/StudentDashboard.js';
import CompanyDashboard from './components/CompanyDashboard.js';
import DriveApplications from './components/DriveApplications.js';

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/admin/dashboard', component: AdminDashboard },
    { path: '/student/dashboard', component: StudentDashboard },
    { path: '/company/dashboard', component: CompanyDashboard },
    { path: '/drive-applications/:id', component: DriveApplications }
];

const router = new VueRouter({
    routes 
});

new Vue({
    el: '#app',
    router: router,
    components: {
        Navbar 
    }
});