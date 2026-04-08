import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Navbar from './components/Navbar.js';
import AdminDashboard from './components/AdminDashboard.js';
import StudentProfile from './components/StudentProfile.js'; 
import DriveProfile from './components/DriveProfile.js';
import CompanyDashboard from './components/CompanyDashboard.js';
import CreateDrive from './components/CreateDrive.js';
import DriveApplications from './components/DriveApplications.js';
import StudentDashboard from './components/StudentDashboard.js';
import CompanyDrives from './components/CompanyDrives.js';
import StudentHistory from './components/StudentHistory.js';

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/admin/dashboard', component: AdminDashboard },
    { path: '/company/dashboard', component: CompanyDashboard },
    
    { path: '/student/dashboard', component: StudentDashboard },
    
    { path: '/student/:id', component: StudentProfile },
    { path: '/drive/:id', component: DriveProfile },
    { path: '/create-drive', component: CreateDrive },
    { path: '/drive-applications/:id', component: DriveApplications },
    { path: '/company-drives/:id', component: CompanyDrives },
    { path: '/student-history', component: StudentHistory }
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