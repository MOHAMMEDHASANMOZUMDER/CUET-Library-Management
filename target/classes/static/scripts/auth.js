// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });

    // Student login form
    const studentLoginForm = document.getElementById('student-login-form');
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const studentId = formData.get('studentId');
            const password = formData.get('password');
            
            // Mock authentication - replace with actual API call
            if (studentId && password) {
                // Store user data in localStorage (temporary)
                localStorage.setItem('userType', 'student');
                localStorage.setItem('userId', studentId);
                localStorage.setItem('userName', 'Mohammad Hasan'); // Mock name
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert('Please enter both Student ID and Password');
            }
        });
    }

    // Admin login form
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const email = formData.get('email');
            const password = formData.get('password');
            
            // Mock authentication - replace with actual API call
            if (email && password) {
                // Store user data in localStorage (temporary)
                localStorage.setItem('userType', 'admin');
                localStorage.setItem('userId', email);
                localStorage.setItem('userName', 'Library Admin');
                
                // Redirect to admin dashboard
                window.location.href = 'admin.html';
            } else {
                alert('Please enter both Email and Password');
            }
        });
    }

    // Registration form
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            // Validate password confirmation
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            // Mock registration - replace with actual API call
            const userData = {
                studentId: formData.get('studentId'),
                name: formData.get('name'),
                email: formData.get('email'),
                department: formData.get('department'),
                session: formData.get('session'),
                password: password
            };
            
            // Show success message and redirect
            alert('Registration successful! Please login with your credentials.');
            window.location.href = 'login.html';
        });
    }
});

// Utility functions for authentication
function logout() {
    // Clear all authentication data
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');  
    localStorage.removeItem('userName');
    
    // Show confirmation
    alert('You have been logged out successfully!');
    
    // Redirect to homepage
    window.location.href = 'index.html';
}

function checkAuth() {
    const userType = localStorage.getItem('userType');
    if (!userType) {
        // Only redirect to login if we're not already on a public page
        const currentPage = window.location.pathname;
        const publicPages = ['/', '/index.html', '/login.html', '/register.html', '/about.html', '/faq.html'];
        
        if (!publicPages.includes(currentPage)) {
            window.location.href = 'login.html';
            return false;
        }
    }
    return true;
}

function getCurrentUser() {
    return {
        type: localStorage.getItem('userType'),
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('userName')
    };
}