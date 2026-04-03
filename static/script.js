import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Navbar from './components/Navbar.js';
import AdminDashboard from './components/AdminDashboard.js';
import StudentDashboard from './components/StudentDashboard.js';

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/admin/dashboard', component: AdminDashboard },
    { path: '/student/dashboard', component: StudentDashboard },
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