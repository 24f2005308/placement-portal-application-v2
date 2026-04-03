import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Navbar from './components/Navbar.js';
import AdminDashboard from './components/AdminDashboard.js';

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/admin/dashboard', component: AdminDashboard }
];

const router = new VueRouter({
    routes 
});

// 3. Create and mount the Vue 2 instance
new Vue({
    el: '#app',
    router: router,
    components: {
        Navbar 
    }
});