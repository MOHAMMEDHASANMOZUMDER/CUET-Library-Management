// Fixed Admin Dashboard JavaScript with Better Error Handling

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Admin dashboard loading...');
    
    // Check if backend API is running
    const isServerRunning = await checkServerHealth();
    if (!isServerRunning) {
        showServerError();
        return;
    }
    
    // Check admin authentication
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');
    
    if (!userType || userType !== 'admin' || !token) {
        console.log('No admin authentication found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    // Initialize admin dashboard with error handling
    console.log('Initializing admin dashboard...');
    await initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
});

// Check if server is running
async function checkServerHealth() {
    try {
        const response = await fetch('/api/auth/health', { 
            method: 'GET',
            timeout: 5000 
        });
        return response.ok;
    } catch (error) {
        console.error('Server health check failed:', error);
        return false;
    }
}

// Show server error message
function showServerError() {
    document.body.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h1 style="color: #dc3545;">⚠️ Server Connection Error</h1>
            <p>The LibraryForge backend server is not running or not accessible.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>To fix this issue:</h3>
                <ol style="text-align: left; display: inline-block;">
                    <li>Make sure your Neon database connection string is set in <code>.env</code> as <code>DATABASE_URL</code></li>
                    <li>Start the Node.js backend:
                        <br><code>npm install</code>
                        <br><code>npm run prisma:generate</code>
                        <br><code>npm start</code>
                    </li>
                    <li>Wait for the server log: <code>[libraryforge] listening on http://localhost:8080</code></li>
                    <li>Refresh this page</li>
                </ol>
            </div>
            <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Retry Connection
            </button>
        </div>
    `;
}

// Safe API call with proper error handling
async function safeApiCall(url, description = 'API call', options = {}) {
    try {
        console.log(`Making ${description} to: ${url}`);

        const method = (options.method || 'GET').toUpperCase();
        const extraHeaders = options.headers || null;
        const headers = {
            ...getAuthHeaders(),
            ...(extraHeaders || {})
        };

        const init = {
            method,
            headers
        };
        if (options.body !== undefined) {
            init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        }

        const response = await fetch(url, init);
        
        console.log(`${description} response status:`, response.status);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
        }

        // Auto-parse JSON when available, otherwise return text (and coerce numeric text)
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`${description} success (json):`, data);
            return data;
        }

        const text = await response.text();
        const trimmed = (text || '').trim();
        if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
            const num = Number(trimmed);
            console.log(`${description} success (number):`, num);
            return num;
        }
        console.log(`${description} success (text):`, trimmed);
        return trimmed;
        
    } catch (error) {
        console.error(`${description} failed:`, error);
        return null;
    }
}

// Initialize dashboard with safe API calls
async function initializeDashboard() {
    // Load dashboard stats safely
    await loadDashboardStatsSafe();
    await loadRecentBooksSafe();
    await loadPendingPrebookingsSafe();
    await loadUserManagementSafe();
    await loadFineManagementSafe();
    await loadNoteManagementSafe();
}

// Utility function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Safe dashboard stats loading
async function loadDashboardStatsSafe() {
    console.log('Loading dashboard stats...');
    
    // Load total books
    const totalBooks = await safeApiCall('/api/books/stats/total', 'Total books');
    if (totalBooks !== null) {
        const totalBooksEl = document.getElementById('total-books');
        if (totalBooksEl) totalBooksEl.textContent = String(totalBooks);
    }
    
    // Load available books
    const availableBooks = await safeApiCall('/api/books/stats/available', 'Available books');
    if (availableBooks !== null) {
        const availableBooksEl = document.getElementById('available-books');
        if (availableBooksEl) availableBooksEl.textContent = `${availableBooks} available`;
    }
    
    // Load student statistics
    const students = await safeApiCall('/api/users/role/STUDENT', 'Student users');
    if (students !== null && Array.isArray(students)) {
        const totalStudents = students.length;
        const activeStudents = students.filter(student => student.enabled).length;
        
        const activeStudentsEl = document.getElementById('active-students');
        const registeredStudentsEl = document.getElementById('registered-students');
        
        if (activeStudentsEl) activeStudentsEl.textContent = activeStudents;
        if (registeredStudentsEl) registeredStudentsEl.textContent = `${totalStudents} total registered`;
    }
    
    // Load pending prebookings
    const prebookings = await safeApiCall('/api/prebooks/admin/status/PENDING', 'Pending prebookings');
    if (prebookings !== null && Array.isArray(prebookings)) {
        const pendingCount = prebookings.length;
        const pendingPrebookingsEl = document.getElementById('pending-prebookings');
        if (pendingPrebookingsEl) pendingPrebookingsEl.textContent = pendingCount;
    }
    
    // Load pending notes
    const noteStats = await safeApiCall('/api/notes/admin/stats', 'Note statistics');
    if (noteStats !== null) {
        const pendingNotesEl = document.getElementById('pending-notes');
        if (pendingNotesEl) pendingNotesEl.textContent = noteStats.pending || 0;
    }
}

// Safe books loading
async function loadRecentBooksSafe() {
    console.log('Loading recent books...');
    
    const books = await safeApiCall('/api/books?page=0&size=5', 'Recent books');
    if (books !== null) {
        const booksData = Array.isArray(books) ? books : (books.content || []);
        displayBooks(booksData);
    }
}

// Safe prebookings loading
async function loadPendingPrebookingsSafe() {
    console.log('Loading pending prebookings...');
    
    const prebookings = await safeApiCall('/api/prebooks/admin/all', 'All prebookings');
    if (prebookings !== null && Array.isArray(prebookings)) {
        const pendingPrebookings = prebookings.filter(pb => pb.status === 'PENDING');
        displayPrebookings(pendingPrebookings.slice(0, 5)); // Show first 5
    }
}

// Safe user management loading
async function loadUserManagementSafe() {
    console.log('Loading user management...');
    
    const users = await safeApiCall('/api/users/all', 'Users');
    if (users !== null) {
        const usersData = Array.isArray(users) ? users : (users.content || []);
        displayUsers(usersData);
    }
}

// Safe fine management loading
async function loadFineManagementSafe() {
    console.log('Loading fine management...');
    
    const fines = await safeApiCall('/api/fines/admin/all', 'All fines');
    if (fines !== null && Array.isArray(fines)) {
        displayFines(fines.slice(0, 5)); // Show first 5
    }
}

// Safe note management loading
async function loadNoteManagementSafe() {
    console.log('Loading note management...');
    
    const notes = await safeApiCall('/api/notes/admin/all', 'All notes');
    if (notes !== null && Array.isArray(notes)) {
        const pendingNotes = notes.filter(note => note.status === 'PENDING');
        displayNotes(pendingNotes.slice(0, 5)); // Show first 5
    }
}

// Display functions with safe DOM manipulation
function displayBooks(books) {
    const tableBody = document.getElementById('book-table-body');
    if (!tableBody) return;
    
    if (!books || books.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No books found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = books.map(book => `
        <tr>
            <td>${escapeHtml(book.title || 'N/A')}</td>
            <td>${escapeHtml(book.author || 'N/A')}</td>
            <td>${book.isbn || 'N/A'}</td>
            <td>${book.availableCopies || 0}/${book.totalCopies || 0}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editBook(${book.isbn})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteBook(${book.isbn})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function displayUsers(users) {
    const tableBody = document.getElementById('user-table-body');
    if (!tableBody) return;
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${escapeHtml(user.name || 'N/A')}</td>
            <td>${escapeHtml(user.email || 'N/A')}</td>
            <td>${escapeHtml(user.department || 'N/A')}</td>
            <td>${escapeHtml(user.studentId || 'N/A')}</td>
            <td>
                <span class="status-badge ${user.enabled ? 'status-active' : 'status-inactive'}">${user.enabled ? 'Active' : 'Inactive'}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-danger" onclick="deleteUser('${user.email}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function displayPrebookings(prebookings) {
    const tableBody = document.getElementById('prebooking-table-body');
    if (!tableBody) return;
    
    if (!prebookings || prebookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No pending prebookings</td></tr>';
        return;
    }
    
    tableBody.innerHTML = prebookings.map(prebook => `
        <tr>
            <td>${escapeHtml(prebook.user?.name || 'N/A')}</td>
            <td>${escapeHtml(prebook.book?.title || 'N/A')}</td>
            <td>${prebook.requestDate || 'N/A'}</td>
            <td><span class="badge badge-pending">${prebook.status}</span></td>
            <td>
                <button class="btn btn-small btn-success" onclick="approvePrebooking(${prebook.id})">Approve</button>
                <button class="btn btn-small btn-danger" onclick="rejectPrebooking(${prebook.id})">Reject</button>
            </td>
        </tr>
    `).join('');
}

function displayFines(fines) {
    const tableBody = document.getElementById('fine-table-body');
    if (!tableBody) return;
    
    if (!fines || fines.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No fines found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = fines.map(fine => `
        <tr>
            <td>${escapeHtml(fine.user?.name || 'N/A')}</td>
            <td>$${fine.amount || 0}</td>
            <td><span class="status-badge ${fine.payment ? 'status-paid' : 'status-unpaid'}">${fine.payment ? 'Paid' : 'Unpaid'}</span></td>
            <td>${fine.paymentSubmissionDate ? new Date(fine.paymentSubmissionDate).toLocaleDateString() : 'N/A'}</td>
            <td>
                ${!fine.payment ? `<button class="btn btn-small btn-success" onclick="markFinePaid(${fine.id})">Mark Paid</button>` : ''}
                <button class="btn btn-small btn-danger" onclick="deleteFine(${fine.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function displayNotes(notes) {
    const tableBody = document.getElementById('note-table-body');
    if (!tableBody) return;
    
    if (!notes || notes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No pending notes</td></tr>';
        return;
    }
    
    tableBody.innerHTML = notes.map(note => `
        <tr>
            <td>${escapeHtml(note.user?.name || 'N/A')}</td>
            <td>${escapeHtml(note.book?.title || 'N/A')}</td>
            <td>${note.uploadTime ? new Date(note.uploadTime).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-small btn-success" onclick="approveNote(${note.id})">Approve</button>
                <button class="btn btn-small btn-danger" onclick="rejectNote(${note.id})">Reject</button>
            </td>
        </tr>
    `).join('');
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupEventListeners() {
    // Add any additional event listeners here
    console.log('Event listeners set up');
}

// Action functions (placeholders - implement as needed)
async function editBook(isbn) { console.log('Edit book:', isbn); }
async function deleteBook(isbn) { console.log('Delete book:', isbn); }
async function activateUser(email) { console.log('Activate user:', email); }
async function deactivateUser(email) { console.log('Deactivate user:', email); }
async function deleteUser(email) {
    try {
        if (!email) return;
        const ok = confirm(`Delete user ${email}? This cannot be undone.`);
        if (!ok) return;

        const result = await safeApiCall(`/api/users/${encodeURIComponent(email)}`, `Delete user ${email}`, {
            method: 'DELETE'
        });
        if (result === null) throw new Error('Delete failed');

        if (typeof showToast === 'function') showToast('User deleted', 'success');
        else alert('User deleted');

        await loadUserManagementSafe();
        await loadDashboardStatsSafe();
    } catch (e) {
        console.error('Delete user failed:', e);
        if (typeof showToast === 'function') showToast('Failed to delete user', 'error');
        else alert('Failed to delete user');
    }
}
async function approvePrebooking(id) { console.log('Approve prebooking:', id); }
async function rejectPrebooking(id) { console.log('Reject prebooking:', id); }
async function markFinePaid(id) { console.log('Mark fine paid:', id); }
async function deleteFine(id) { console.log('Delete fine:', id); }
async function approveNote(id) { console.log('Approve note:', id); }
async function rejectNote(id) { console.log('Reject note:', id); }

// Admin pages don't load scripts/auth.js, so provide logout here.
function logout() {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('role');
        localStorage.removeItem('userStudentId');
        localStorage.removeItem('userDepartment');
        localStorage.removeItem('userSession');
    } catch (_) {}
    window.location.href = 'login.html';
}

// Avoid runtime errors from the "Show More Users" button when we already load all users.
function showMoreUsers() {
    if (typeof showToast === 'function') showToast('All users are already loaded on this page.', 'info');
    else alert('All users are already loaded on this page.');
}

console.log('Admin.js loaded successfully');
