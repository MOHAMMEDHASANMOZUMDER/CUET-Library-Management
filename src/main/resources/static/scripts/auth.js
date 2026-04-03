// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Apply saved theme early (settings stores it in localStorage)
    try { applySavedTheme(); } catch (_) {}

    // Prevent "login lock" when an expired token is still in localStorage
    try { clearExpiredAuth(); } catch (_) {}

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
                const data = await safeJson(resp);

                // Store auth details
                clearAuthStorage();
                localStorage.setItem('token', data.token);
                localStorage.setItem('userType', 'student');
                localStorage.setItem('userId', data.email || email);
                localStorage.setItem('userEmail', data.email || email);
                localStorage.setItem('userName', data.name || 'Student');
                localStorage.setItem('role', (data.role || 'STUDENT'));

                // Verify token
                const verify = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + data.token }});
                if(!verify.ok){
                    localStorage.clear();
                    throw new Error('Token verification failed');
                }
                try {
                    const me = await safeJson(verify);
                    if (me && me.studentId) localStorage.setItem('userStudentId', String(me.studentId));
                    if (me && me.department) localStorage.setItem('userDepartment', String(me.department));
                    if (me && me.session) localStorage.setItem('userSession', String(me.session));
                } catch (_) {}
                window.location.href = 'dashboard.html';
            } catch (err) {
                alert(err.message || 'Login failed');
            }
        });
    }

    // Admin login form
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const email = formData.get('email');
            const password = formData.get('password');
            if(!email || !password){ alert('Please enter both Email and Password'); return; }
            try {
                const resp = await fetch('/api/auth/login', {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ email, password })
                });
                if(!resp.ok){
                    const t = await resp.text();
                    throw new Error(t || 'Invalid credentials');
                }
                const data = await safeJson(resp);
                clearAuthStorage();
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.email || email);
                localStorage.setItem('userEmail', data.email || email);
                localStorage.setItem('userName', data.name || 'Admin');
                localStorage.setItem('role', (data.role || 'ADMIN'));
                localStorage.setItem('userType', (data.role === 'ADMIN') ? 'admin' : 'student');
                // Verify token
                const verify = await fetch('/api/auth/me', { headers: { 'Authorization':'Bearer '+data.token }});
                if(!verify.ok){
                    localStorage.clear();
                    throw new Error('Token verification failed');
                }
                try {
                    const me = await safeJson(verify);
                    if (me && me.studentId) localStorage.setItem('userStudentId', String(me.studentId));
                    if (me && me.department) localStorage.setItem('userDepartment', String(me.department));
                    if (me && me.session) localStorage.setItem('userSession', String(me.session));
                } catch (_) {}
                // Redirect based on role
                if((data.role || '').toUpperCase()==='ADMIN') window.location.href='admin.html';
                else window.location.href='dashboard.html';
            } catch(err){
                alert(err.message || 'Admin login failed');
            }
        });
    }

    // Registration form
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        const sendOtpBtn = document.getElementById('send-register-otp');
        const otpGroup = document.getElementById('register-otp-group');
        const otpHint = document.getElementById('register-otp-hint');
        const submitBtn = document.getElementById('register-submit');

        if (sendOtpBtn) {
            sendOtpBtn.addEventListener('click', async function() {
                const formData = new FormData(registrationForm);
                const email = (formData.get('email') || '').toString().trim();
                const statusEl = document.getElementById('register-status');
                if (statusEl) { statusEl.style.display='none'; statusEl.textContent=''; }
                if (otpHint) { otpHint.style.display='none'; otpHint.textContent=''; }

                if (!email) {
                    if (statusEl) { statusEl.style.display='block'; statusEl.textContent='Please enter your email first.'; }
                    else alert('Please enter your email first.');
                    return;
                }

                try {
                    const resp = await fetch('/api/auth/register/request-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });

                    if (!resp.ok) {
                        const text = await resp.text();
                        throw new Error(text || 'Failed to send OTP');
                    }

                    const data = await safeJson(resp);
                    if (otpGroup) otpGroup.style.display = 'block';
                    if (submitBtn) submitBtn.disabled = false;

                    if (otpHint) {
                        otpHint.style.display = 'block';
                        otpHint.style.color = '#047857';
                        otpHint.textContent = 'OTP sent. Please check your email.';
                        if (data && data.devOtp && shouldShowDevOtp()) {
                            otpHint.textContent = `OTP sent (dev): ${data.devOtp}. Expires soon.`;
                        } else if (data && data.devOtp) {
                            otpHint.textContent = 'Email is not configured; set SMTP_* in .env to receive OTP in inbox.';
                        }
                    }
                } catch (err) {
                    if (statusEl) {
                        statusEl.style.display='block';
                        statusEl.style.color='#dc2626';
                        statusEl.textContent = err.message || 'Failed to send OTP';
                    } else {
                        alert(err.message || 'Failed to send OTP');
                    }
                }
            });
        }

        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            const otp = (formData.get('otp') || '').toString().trim();
            if (!otp) {
                alert('Please enter the email OTP first.');
                return;
            }

            // Build payload expected by backend /register/verify-otp
            const payload = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: password,
                department: formData.get('department'),
                studentId: formData.get('studentId'),
                session: formData.get('session'),
                otp
            };

            const statusEl = document.getElementById('register-status');
            if(statusEl){ statusEl.style.display='none'; statusEl.textContent=''; }
            try {
                const resp = await fetch('/api/auth/register/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!resp.ok) {
                    const text = await resp.text();
                    throw new Error(text || 'Registration failed');
                }
                const data = await safeJson(resp);

                // Auto-login after verified registration
                if (data && data.token) {
                    clearAuthStorage();
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userType', 'student');
                    localStorage.setItem('userId', data.email || payload.email);
                    localStorage.setItem('userEmail', data.email || payload.email);
                    localStorage.setItem('userName', data.name || payload.name || 'Student');
                    localStorage.setItem('role', (data.role || 'STUDENT'));

                    try {
                        const meResp = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + data.token }});
                        if (meResp.ok) {
                            const me = await safeJson(meResp);
                            if (me && me.studentId) localStorage.setItem('userStudentId', String(me.studentId));
                            if (me && me.department) localStorage.setItem('userDepartment', String(me.department));
                            if (me && me.session) localStorage.setItem('userSession', String(me.session));
                        }
                    } catch (_) {}
                }

                if(statusEl){
                    statusEl.style.display='block';
                    statusEl.style.color='#047857';
                    statusEl.textContent='Registration verified! Redirecting...';
                }
                setTimeout(()=>{ window.location.href='dashboard.html'; }, 600);
            } catch (err) {
                if(statusEl){
                    statusEl.style.display='block';
                    statusEl.style.color='#dc2626';
                    statusEl.textContent= err.message || 'Registration failed';
                } else {
                    alert(err.message || 'Registration failed');
                }
            }
        });
    }

    // Forgot password (OTP)
    const forgotForm = document.getElementById('forgot-password-form');
    const sendResetOtpBtn = document.getElementById('send-reset-otp');
    const resetOtpGroup = document.getElementById('reset-otp-group');
    const resetPassGroup = document.getElementById('reset-password-group');
    const resetSubmit = document.getElementById('reset-submit');
    const resetStatus = document.getElementById('reset-status');

    if (sendResetOtpBtn) {
        sendResetOtpBtn.addEventListener('click', async function() {
            const email = (document.getElementById('reset-email')?.value || '').toString().trim();
            if (resetStatus) { resetStatus.style.display='none'; resetStatus.textContent=''; }
            if (!email) {
                if (resetStatus) { resetStatus.style.display='block'; resetStatus.textContent='Please enter your email.'; }
                else alert('Please enter your email.');
                return;
            }

            try {
                const resp = await fetch('/api/auth/forgot/request-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                if (!resp.ok) {
                    const text = await resp.text();
                    throw new Error(text || 'Failed to send reset OTP');
                }
                const data = await safeJson(resp);
                if (resetOtpGroup) resetOtpGroup.style.display = 'block';
                if (resetPassGroup) resetPassGroup.style.display = 'block';
                if (resetSubmit) resetSubmit.disabled = false;
                if (resetStatus) {
                    resetStatus.style.display='block';
                    resetStatus.style.color='#047857';
                    resetStatus.textContent = 'Reset OTP sent. Please check your email.';
                    if (data && data.devOtp && shouldShowDevOtp()) {
                        resetStatus.textContent = `Reset OTP (dev): ${data.devOtp}. Expires soon.`;
                    } else if (data && data.devOtp) {
                        resetStatus.textContent = 'Email is not configured; set SMTP_* in .env to receive OTP in inbox.';
                    }
                }
            } catch (err) {
                if (resetStatus) {
                    resetStatus.style.display='block';
                    resetStatus.style.color='#dc2626';
                    resetStatus.textContent = err.message || 'Failed to send reset OTP';
                } else {
                    alert(err.message || 'Failed to send reset OTP');
                }
            }
        });
    }

    if (forgotForm) {
        forgotForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = (document.getElementById('reset-email')?.value || '').toString().trim();
            const otp = (document.getElementById('reset-otp')?.value || '').toString().trim();
            const newPassword = (document.getElementById('reset-new-password')?.value || '').toString();

            if (resetStatus) { resetStatus.style.display='none'; resetStatus.textContent=''; }
            if (!email || !otp || !newPassword) {
                if (resetStatus) {
                    resetStatus.style.display='block';
                    resetStatus.style.color='#dc2626';
                    resetStatus.textContent='Please fill email, OTP, and new password.';
                } else {
                    alert('Please fill email, OTP, and new password.');
                }
                return;
            }

            try {
                const resp = await fetch('/api/auth/forgot/reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, newPassword })
                });
                if (!resp.ok) {
                    const text = await resp.text();
                    throw new Error(text || 'Password reset failed');
                }

                if (resetStatus) {
                    resetStatus.style.display='block';
                    resetStatus.style.color='#047857';
                    resetStatus.textContent='Password updated. You can login now.';
                }

                // Close modal if present
                const modal = document.getElementById('forgot-password-modal');
                setTimeout(() => {
                    if (modal) modal.style.display = 'none';
                    forgotForm.reset();
                    if (resetOtpGroup) resetOtpGroup.style.display = 'none';
                    if (resetPassGroup) resetPassGroup.style.display = 'none';
                    if (resetSubmit) resetSubmit.disabled = true;
                    if (resetStatus) resetStatus.style.display = 'none';
                }, 800);
            } catch (err) {
                if (resetStatus) {
                    resetStatus.style.display='block';
                    resetStatus.style.color='#dc2626';
                    resetStatus.textContent = err.message || 'Password reset failed';
                } else {
                    alert(err.message || 'Password reset failed');
                }
            }
        });
    }

    // Render authenticated navbar if logged in
    try { applyAuthenticatedNavbar(); } catch (_) {}
});

function applySavedTheme(){
    const theme = localStorage.getItem('cuet-theme') || 'light';
    if (theme === 'dark') document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
}

// Utility functions for authentication
function logout() {
    clearAuthStorage();
    alert('You have been logged out successfully!');
    window.location.href = 'index.html';
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || !userType) {
        const currentPage = window.location.pathname;
        const publicPages = ['/', '/index.html', '/login.html', '/register.html', '/about.html', '/faq.html'];
        if (!publicPages.includes(currentPage)) {
            window.location.href = 'login.html';
            return false;
        }
    } else if (isTokenExpired(token)) {
        clearAuthStorage();
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function clearAuthStorage(){
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('userStudentId');
    localStorage.removeItem('userDepartment');
    localStorage.removeItem('userSession');
}

function getJwtPayload(token){
    if (!token) return null;
    const parts = String(token).split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    try {
        const json = atob(padded);
        return JSON.parse(json);
    } catch (_) {
        return null;
    }
}

function isTokenExpired(token, skewSeconds = 30){
    const payload = getJwtPayload(token);
    if (!payload || !payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return Number(payload.exp) <= (now + skewSeconds);
}

function clearExpiredAuth(){
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) clearAuthStorage();
}

function getCurrentUser() {
    return {
        type: localStorage.getItem('userType'),
        id: localStorage.getItem('userId'),
        email: localStorage.getItem('userEmail'),
        name: localStorage.getItem('userName'),
        role: localStorage.getItem('role'),
        studentId: localStorage.getItem('userStudentId'),
        department: localStorage.getItem('userDepartment'),
        session: localStorage.getItem('userSession')
    };
}

function shouldShowDevOtp(){
    try {
        const qs = String(window.location.search || '');
        if (qs.includes('devOtp=1')) return true;
        return localStorage.getItem('showDevOtp') === 'true';
    } catch (_) {
        return false;
    }
}

// Replace navbar with logged-in links and profile dropdown
function applyAuthenticatedNavbar() {
    const token = localStorage.getItem('token');
    if (!token) return; // not logged in

    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.innerHTML = `
            <a href="dashboard.html" class="nav-link">Dashboard</a>
            <a href="books.html" class="nav-link">Books</a>
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
                            <button id="userMenuBtn" class="btn btn-outline" style="color:var(--text-primary);">
                <i data-lucide="user"></i><span style="margin:0 6px;">${name}</span><i data-lucide="chevron-down"></i>
              </button>
                            <div id="userDropdown" style="display:none; position:absolute; right:0; top:110%; background:var(--card); border:1px solid var(--border); border-radius:10px; min-width:180px; padding:6px;">
                                <a class="nav-link" href="editprof.html" style="display:block; padding:10px 12px; color:var(--text-secondary);">Edit Profile</a>
                                <a class="nav-link" href="settings.html" style="display:block; padding:10px 12px; color:var(--text-secondary);">Settings</a>
                                <button id="logoutBtn" class="btn" style="width:100%; text-align:left; background:transparent; color:var(--text-secondary); padding:10px 12px;">Logout</button>
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

// Safe JSON parse helper
async function safeJson(resp){
    const ct = resp.headers.get('Content-Type') || '';
    if(ct.includes('application/json')) return resp.json();
    const text = await resp.text();
    try { return JSON.parse(text); } catch { return { raw: text }; }
}