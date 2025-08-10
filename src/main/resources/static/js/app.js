// Library Management System Frontend Application
class LibraryApp {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.token = localStorage.getItem('authToken');
        this.currentUser = null;
        this.currentPage = 0;
        this.pageSize = 12;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.showWelcome();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Search functionality
        const bookSearch = document.getElementById('bookSearch');
        if (bookSearch) {
            bookSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchBooks();
                }
            });
        }
    }

    // Authentication Methods
    async handleLogin(e) {
        e.preventDefault();
        
        const studentId = document.getElementById('loginStudentId').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                localStorage.setItem('authToken', this.token);
                
                this.currentUser = {
                    studentId: data.studentId,
                    fullName: data.fullName,
                    role: data.role
                };
                
                this.updateAuthUI();
                this.showAlert('Login successful!', 'success');
                this.showDashboard();
            } else {
                const errorText = await response.text();
                this.showAlert(`Login failed: ${errorText}`, 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Login failed. Please check your connection.', 'danger');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = {
            studentId: document.getElementById('registerStudentId').value,
            fullName: document.getElementById('registerFullName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            department: document.getElementById('registerDepartment').value,
            session: document.getElementById('registerSession').value
        };

        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showAlert('Registration successful! Please login.', 'success');
                this.showLogin();
                document.getElementById('registerForm').reset();
            } else {
                const errorText = await response.text();
                this.showAlert(`Registration failed: ${errorText}`, 'danger');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('Registration failed. Please check your connection.', 'danger');
        }
    }

    async checkAuthStatus() {
        if (this.token) {
            try {
                const response = await fetch(`${this.baseURL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });

                if (response.ok) {
                    this.currentUser = await response.json();
                    this.updateAuthUI();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Auth check error:', error);
                this.logout();
            }
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        this.updateAuthUI();
        this.showWelcome();
        this.showAlert('Logged out successfully', 'info');
    }

    updateAuthUI() {
        const loginNav = document.getElementById('loginNav');
        const registerNav = document.getElementById('registerNav');
        const userNav = document.getElementById('userNav');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            loginNav.style.display = 'none';
            registerNav.style.display = 'none';
            userNav.style.display = 'block';
            userName.textContent = this.currentUser.fullName || this.currentUser.studentId;
        } else {
            loginNav.style.display = 'block';
            registerNav.style.display = 'block';
            userNav.style.display = 'none';
        }
    }

    // API Helper Methods
    async apiCall(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (response.status === 401) {
                this.logout();
                throw new Error('Authentication required');
            }

            return response;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    // UI Navigation Methods
    hideAllSections() {
        const sections = [
            'welcomeSection', 'loginSection', 'registerSection', 
            'dashboardSection', 'booksSection', 'myBorrowsSection'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
    }

    showWelcome() {
        this.hideAllSections();
        document.getElementById('welcomeSection').style.display = 'block';
    }

    showLogin() {
        this.hideAllSections();
        document.getElementById('loginSection').style.display = 'block';
    }

    showRegister() {
        this.hideAllSections();
        document.getElementById('registerSection').style.display = 'block';
    }

    async showDashboard() {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }

        this.hideAllSections();
        document.getElementById('dashboardSection').style.display = 'block';
        await this.loadDashboardStats();
    }

    async showBooks() {
        this.hideAllSections();
        document.getElementById('booksSection').style.display = 'block';
        await this.loadBooks();
    }

    async showMyBorrows() {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }

        this.hideAllSections();
        document.getElementById('myBorrowsSection').style.display = 'block';
        await this.loadMyBorrows();
    }

    // Dashboard Methods
    async loadDashboardStats() {
        try {
            // Load total books
            const totalBooksResponse = await this.apiCall('/books/stats/total');
            if (totalBooksResponse.ok) {
                const totalBooks = await totalBooksResponse.text();
                document.getElementById('totalBooks').textContent = totalBooks;
            }

            // Load available books
            const availableBooksResponse = await this.apiCall('/books/stats/available');
            if (availableBooksResponse.ok) {
                const availableBooks = await availableBooksResponse.text();
                document.getElementById('availableBooks').textContent = availableBooks;
            }

            // Load my active borrows
            const myBorrowsResponse = await this.apiCall('/borrow/my-active-borrows');
            if (myBorrowsResponse.ok) {
                const myBorrows = await myBorrowsResponse.json();
                document.getElementById('myBorrows').textContent = myBorrows.length;
            }

            // Load total active borrows (for librarians/admins)
            if (this.currentUser.role === 'ADMIN' || this.currentUser.role === 'LIBRARIAN') {
                const activeBorrowsResponse = await this.apiCall('/borrow/stats/active');
                if (activeBorrowsResponse.ok) {
                    const activeBorrows = await activeBorrowsResponse.text();
                    document.getElementById('activeBorrows').textContent = activeBorrows;
                }
            } else {
                document.getElementById('activeBorrows').textContent = '-';
            }

        } catch (error) {
            console.error('Dashboard stats error:', error);
            this.showAlert('Failed to load dashboard statistics', 'warning');
        }
    }

    // Books Methods
    async loadBooks(searchKeyword = '', page = 0) {
        try {
            let endpoint = `/books?page=${page}&size=${this.pageSize}`;
            
            if (searchKeyword) {
                endpoint = `/books/search?keyword=${encodeURIComponent(searchKeyword)}&page=${page}&size=${this.pageSize}`;
            }

            const response = await this.apiCall(endpoint);
            
            if (response.ok) {
                const data = await response.json();
                this.renderBooks(data.content);
            } else {
                this.showAlert('Failed to load books', 'danger');
            }
        } catch (error) {
            console.error('Load books error:', error);
            this.showAlert('Failed to load books', 'danger');
        }
    }

    renderBooks(books) {
        const container = document.getElementById('booksContainer');
        
        if (!books || books.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="fas fa-book-open fa-3x mb-3"></i>
                        <h4>No books found</h4>
                        <p>Try adjusting your search criteria or check back later.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = books.map(book => `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card book-card h-100">
                    <div class="card-body position-relative">
                        <span class="availability-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}">
                            ${book.availableCopies > 0 ? 'Available' : 'Not Available'}
                        </span>
                        <h5 class="book-title">${this.escapeHtml(book.title)}</h5>
                        <p class="book-details">
                            <strong>ISBN:</strong> ${book.isbn}<br>
                            <strong>Department:</strong> ${book.department || 'N/A'}<br>
                            <strong>Category:</strong> ${book.category || 'N/A'}<br>
                            <strong>Available:</strong> ${book.availableCopies}/${book.totalCopies}
                        </p>
                        ${book.description ? `<p class="text-muted small">${this.escapeHtml(book.description.substring(0, 100))}...</p>` : ''}
                    </div>
                    <div class="card-footer">
                        ${this.currentUser && book.availableCopies > 0 ? 
                            `<button class="btn btn-primary btn-sm w-100" onclick="app.borrowBook(${book.id})">
                                <i class="fas fa-hand-holding"></i> Borrow Book
                            </button>` :
                            `<button class="btn btn-secondary btn-sm w-100" disabled>
                                ${!this.currentUser ? 'Login to Borrow' : 'Not Available'}
                            </button>`
                        }
                    </div>
                </div>
            </div>
        `).join('');
    }

    async searchBooks() {
        const searchInput = document.getElementById('bookSearch');
        const keyword = searchInput.value.trim();
        await this.loadBooks(keyword);
    }

    async borrowBook(bookId) {
        if (!this.currentUser) {
            this.showAlert('Please login to borrow books', 'warning');
            return;
        }

        try {
            const response = await this.apiCall(`/borrow/book/${bookId}`, {
                method: 'POST'
            });

            if (response.ok) {
                this.showAlert('Book borrowed successfully!', 'success');
                await this.loadBooks(); // Refresh books list
                await this.loadDashboardStats(); // Refresh stats
            } else {
                const errorText = await response.text();
                this.showAlert(`Failed to borrow book: ${errorText}`, 'danger');
            }
        } catch (error) {
            console.error('Borrow book error:', error);
            this.showAlert('Failed to borrow book', 'danger');
        }
    }

    // My Borrows Methods
    async loadMyBorrows() {
        try {
            const response = await this.apiCall('/borrow/my-borrows');
            
            if (response.ok) {
                const borrows = await response.json();
                this.renderMyBorrows(borrows);
            } else {
                this.showAlert('Failed to load your borrows', 'danger');
            }
        } catch (error) {
            console.error('Load borrows error:', error);
            this.showAlert('Failed to load your borrows', 'danger');
        }
    }

    renderMyBorrows(borrows) {
        const tbody = document.getElementById('borrowsTableBody');
        
        if (!borrows || borrows.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="alert alert-info mb-0">
                            <i class="fas fa-book-reader fa-2x mb-2"></i>
                            <p class="mb-0">You haven't borrowed any books yet.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = borrows.map(borrow => `
            <tr>
                <td>
                    <strong>${this.escapeHtml(borrow.book.title)}</strong><br>
                    <small class="text-muted">ISBN: ${borrow.book.isbn}</small>
                </td>
                <td>${this.formatDate(borrow.borrowDate)}</td>
                <td>${this.formatDate(borrow.dueDate)}</td>
                <td>
                    <span class="badge status-${borrow.status.toLowerCase()}">
                        ${this.formatStatus(borrow.status)}
                    </span>
                </td>
                <td>
                    ${this.renderBorrowActions(borrow)}
                </td>
            </tr>
        `).join('');
    }

    renderBorrowActions(borrow) {
        let actions = '';
        
        if (borrow.status === 'BORROWED') {
            actions += `
                <button class="btn btn-success btn-sm me-1" onclick="app.returnBook(${borrow.id})">
                    <i class="fas fa-undo"></i> Return
                </button>
            `;
            
            // Check if renewal is possible (simplified check)
            if (borrow.renewalCount < 2) {
                actions += `
                    <button class="btn btn-warning btn-sm" onclick="app.renewBook(${borrow.id})">
                        <i class="fas fa-refresh"></i> Renew
                    </button>
                `;
            }
        }
        
        return actions || '<span class="text-muted">No actions</span>';
    }

    async returnBook(borrowRecordId) {
        try {
            const response = await this.apiCall(`/borrow/return/${borrowRecordId}`, {
                method: 'PUT'
            });

            if (response.ok) {
                this.showAlert('Book returned successfully!', 'success');
                await this.loadMyBorrows(); // Refresh borrows list
                await this.loadDashboardStats(); // Refresh stats
            } else {
                const errorText = await response.text();
                this.showAlert(`Failed to return book: ${errorText}`, 'danger');
            }
        } catch (error) {
            console.error('Return book error:', error);
            this.showAlert('Failed to return book', 'danger');
        }
    }

    async renewBook(borrowRecordId) {
        try {
            const response = await this.apiCall(`/borrow/renew/${borrowRecordId}`, {
                method: 'PUT'
            });

            if (response.ok) {
                this.showAlert('Book renewed successfully!', 'success');
                await this.loadMyBorrows(); // Refresh borrows list
            } else {
                const errorText = await response.text();
                this.showAlert(`Failed to renew book: ${errorText}`, 'danger');
            }
        } catch (error) {
            console.error('Renew book error:', error);
            this.showAlert('Failed to renew book', 'danger');
        }
    }

    // Utility Methods
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatStatus(status) {
        const statusMap = {
            'BORROWED': 'Borrowed',
            'RETURNED': 'Returned',
            'OVERDUE': 'Overdue',
            'LOST': 'Lost'
        };
        return statusMap[status] || status;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showAlert(message, type = 'info') {
        const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
        const title = document.getElementById('alertModalTitle');
        const body = document.getElementById('alertModalBody');
        
        const titleMap = {
            'success': 'Success',
            'danger': 'Error',
            'warning': 'Warning',
            'info': 'Information'
        };
        
        const iconMap = {
            'success': 'fas fa-check-circle text-success',
            'danger': 'fas fa-exclamation-triangle text-danger',
            'warning': 'fas fa-exclamation-circle text-warning',
            'info': 'fas fa-info-circle text-info'
        };
        
        title.textContent = titleMap[type] || 'Alert';
        body.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="${iconMap[type]} fa-2x me-3"></i>
                <span>${message}</span>
            </div>
        `;
        
        alertModal.show();
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                alertModal.hide();
            }, 2000);
        }
    }
}

// Global functions for onclick handlers
window.showDashboard = () => app.showDashboard();
window.showBooks = () => app.showBooks();
window.showMyBorrows = () => app.showMyBorrows();
window.showLogin = () => app.showLogin();
window.showRegister = () => app.showRegister();
window.logout = () => app.logout();
window.searchBooks = () => app.searchBooks();

// Initialize the application
const app = new LibraryApp();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LibraryApp;
}
