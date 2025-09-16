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
        studentLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const email = formData.get('email');
            const password = formData.get('password');

            if (!email || !password) {
                alert('Please enter both Email and Password');
                return;
            }

            try {
                const resp = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!resp.ok) {
                    // Show server-provided error for debugging
                    const errorText = await resp.text();
                    throw new Error(errorText || 'Invalid credentials');
                }
                const data = await resp.json();

                // Store minimal auth details
                localStorage.setItem('token', data.token);
                localStorage.setItem('userType', 'student');
                localStorage.setItem('userId', email);
                localStorage.setItem('userName', data.name || 'Student');

                window.location.href = 'dashboard.html';
            } catch (err) {
                alert(err.message || 'Login failed');
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
            
            // Mock authentication - replace with actual API call if admins use backend auth later
            if (email && password) {
                localStorage.setItem('userType', 'admin');
                localStorage.setItem('userId', email);
                localStorage.setItem('userName', 'Library Admin');
                window.location.href = 'admin.html';
            } else {
                alert('Please enter both Email and Password');
            }
        });
    }

    // Registration form
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Build payload expected by backend RegisterRequest (name, email, password, department)
            const payload = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: password,
                department: formData.get('department')
            };

            try {
                const resp = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!resp.ok) {
                    const text = await resp.text();
                    throw new Error(text || 'Registration failed');
                }

                alert('Registration successful! Please login with your credentials.');
                window.location.href = 'login.html';
            } catch (err) {
                alert(err.message || 'Registration failed');
            }
        });
    }

    // Render authenticated navbar if logged in
    try { applyAuthenticatedNavbar(); } catch (_) {}
});

// Utility functions for authentication
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');  
    localStorage.removeItem('userName');
    alert('You have been logged out successfully!');
    window.location.href = 'index.html';
}

function checkAuth() {
    const userType = localStorage.getItem('userType');
    if (!userType) {
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

// Replace navbar with logged-in links and profile dropdown
function applyAuthenticatedNavbar() {
    const token = localStorage.getItem('token');
    if (!token) return; // not logged in

    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.innerHTML = `
            <a href="dashboard.html" class="nav-link">Dashboard</a>
            <a href="my-books.html" class="nav-link">My Books</a>
            <a href="fines.html" class="nav-link">Fines</a>
            <a href="notes.html" class="nav-link">Notes</a>
        `;
    }

    const authButtons = document.querySelector('.header-actions.auth-buttons');
    if (authButtons) {
        const name = (localStorage.getItem('userName') || 'Profile').split(' ')[0];
        authButtons.innerHTML = `
            <div class="user-menu" style="position:relative;">
              <button id="userMenuBtn" class="btn btn-outline" style="color:#cfe9d1;">
                <i data-lucide="user"></i><span style="margin:0 6px;">${name}</span><i data-lucide="chevron-down"></i>
              </button>
              <div id="userDropdown" style="display:none; position:absolute; right:0; top:110%; background:#0b1220; border:1px solid rgba(255,255,255,0.06); border-radius:10px; min-width:180px; padding:6px;">
                <a class="nav-link" href="editprof.html" style="display:block; padding:10px 12px; color:#cfe9d1;">Edit Profile</a>
                <a class="nav-link" href="settings.html" style="display:block; padding:10px 12px; color:#cfe9d1;">Settings</a>
                <button id="logoutBtn" class="btn" style="width:100%; text-align:left; background:transparent; color:#cfe9d1; padding:10px 12px;">Logout</button>
              </div>
            </div>
        `;

        const btn = authButtons.querySelector('#userMenuBtn');
        const dd = authButtons.querySelector('#userDropdown');
        if (btn && dd) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                dd.style.display = (dd.style.display === 'none' || !dd.style.display) ? 'block' : 'none';
            });
            document.addEventListener('click', (e) => {
                if (!authButtons.contains(e.target)) dd.style.display = 'none';
            });
        }
        const logoutBtn = authButtons.querySelector('#logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });

        if (window.lucide) lucide.createIcons();
    }

    // Mark active link based on current path
    if (navLinks) {
        const current = location.pathname.split('/').pop();
        navLinks.querySelectorAll('.nav-link').forEach(a => {
            if (a.getAttribute('href') === current) a.classList.add('active');
        });
    }
}