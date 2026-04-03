// API Configuration and Service
class ApiService {
    static BASE_URL = window.location.origin + '/api';
    static TOKEN_KEY = 'library_jwt_token';
    static USER_KEY = 'library_user_data';

    // Get stored token
    static getToken() {
        // Prefer existing project-wide key 'token' if present, fallback to ApiService key
        return (
            localStorage.getItem('token') ||
            localStorage.getItem(this.TOKEN_KEY)
        );
    }

    // Set token
    static setToken(token) {
        // Write to both keys for compatibility
        localStorage.setItem('token', token);
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    // Remove token
    static removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    // Get user data
    static getUser() {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    // Set user data
    static setUser(userData) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    }

    // Generic API request method
    static async request(endpoint, options = {}) {
        const token = this.getToken();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Handle FormData (for file uploads)
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type']; // Let browser set boundary
        }

        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, config);

            // Handle unauthorized - redirect to login
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Unauthorized access');
            }

            // Handle other error statuses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Return response data
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else if (contentType && contentType.includes('text/')) {
                return await response.text();
            } else {
                return await response.blob();
            }

        } catch (error) {
            console.error('API Request failed:', error);
            this.showErrorNotification('API Error', error.message);
            throw error;
        }
    }

    // Handle unauthorized access
    static handleUnauthorized() {
        this.removeToken();
        if (window.location.pathname !== '/login.html') {
            window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
        }
    }

    // Show error notification
    static showErrorNotification(title, message) {
        if (typeof showNotification === 'function') {
            showNotification(message, 'error');
        } else {
            alert(`${title}: ${message}`);
        }
    }

    // Authentication API methods
    static async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.token) {
            this.setToken(response.token);
            this.setUser({
                email: response.email,
                name: response.name,
                role: response.role
            });
        }
        
        return response;
    }

    static async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // Book API methods
    static async getBooks(page = 0, size = 10) {
        return await this.request(`/books?page=${page}&size=${size}`);
    }

    static async searchBooks(keyword, page = 0, size = 10) {
        return await this.request(`/books/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    }

    static async getBook(isbn) {
        return await this.request(`/books/${isbn}`);
    }

    static async createBook(bookData) {
        return await this.request('/books', {
            method: 'POST',
            body: JSON.stringify(bookData)
        });
    }

    static async updateBook(isbn, bookData) {
        return await this.request(`/books/${isbn}`, {
            method: 'PUT',
            body: JSON.stringify(bookData)
        });
    }

    static async deleteBook(isbn) {
        return await this.request(`/books/${isbn}`, {
            method: 'DELETE'
        });
    }

    // Borrowing API methods
    static async borrowBook(isbn) {
        return await this.request(`/borrow/book/${isbn}`, {
            method: 'POST'
        });
    }

    static async getMyBorrows() {
        return await this.request('/borrow/my-borrows');
    }

    static async getActiveBorrows() {
        return await this.request('/borrow/my-active-borrows');
    }

    static async returnBook(borrowId) {
        return await this.request(`/borrow/return/${borrowId}`, {
            method: 'PUT'
        });
    }

    // Fine API methods
    static async getUserFines() {
        return await this.request('/fines/user');
    }

    static async payFine(fineId) {
        return await this.request(`/fines/${fineId}/pay`, {
            method: 'POST'
        });
    }

    // Note API methods
    static async getNotesByBook(isbn) {
        return await this.request(`/notes/book/${isbn}`);
    }

    static async getApprovedNotes() {
        return await this.request('/notes/public/approved');
    }

    static async getUserNotes() {
        return await this.request('/notes/user');
    }

    static async uploadNote(formData) {
        return await this.request('/notes/upload', {
            method: 'POST',
            body: formData // FormData object
        });
    }

    static async downloadNote(noteId) {
        const response = await fetch(`${this.BASE_URL}/notes/${noteId}/download`, {
            headers: {
                Authorization: `Bearer ${this.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        return response;
    }

    static async approveNote(noteId) {
        return await this.request(`/notes/${noteId}/approve`, {
            method: 'POST'
        });
    }

    static async rejectNote(noteId) {
        return await this.request(`/notes/${noteId}/reject`, {
            method: 'POST'
        });
    }

    // User management API methods (Admin)
    static async getAllUsers(page = 0, size = 10) {
        return await this.request(`/users?page=${page}&size=${size}`);
    }

    static async updateUser(userId, userData) {
        return await this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    static async deleteUser(userId) {
        return await this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // Statistics API methods
    static async getBookStats() {
        const totalBooks = await this.request('/books/stats/total');
        const availableBooks = await this.request('/books/stats/available');
        return { total: totalBooks, available: availableBooks };
    }

    // Utility methods
    static isLoggedIn() {
        return !!this.getToken();
    }

    static isAdmin() {
        const user = this.getUser();
        return user && user.role === 'ADMIN';
    }

    static logout() {
        this.removeToken();
        window.location.href = '/login.html';
    }
}

// Loading state management
class LoadingManager {
    static show(element, text = 'Loading...') {
        if (element) {
            element.disabled = true;
            const originalText = element.textContent;
            element.setAttribute('data-original-text', originalText);
            element.textContent = text;
            element.classList.add('loading');
        }
    }

    static hide(element) {
        if (element) {
            element.disabled = false;
            const originalText = element.getAttribute('data-original-text');
            if (originalText) {
                element.textContent = originalText;
                element.removeAttribute('data-original-text');
            }
            element.classList.remove('loading');
        }
    }

    static showSpinner(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
        }
    }

    static hideSpinner(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const spinner = container.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }
}

// Notification system
class NotificationManager {
    static show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add to page
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    static success(message, duration = 5000) {
        this.show(message, 'success', duration);
    }

    static error(message, duration = 8000) {
        this.show(message, 'error', duration);
    }

    static warning(message, duration = 6000) {
        this.show(message, 'warning', duration);
    }

    static info(message, duration = 5000) {
        this.show(message, 'info', duration);
    }
}

// File upload utilities
class FileUtils {
    static validateFile(file, maxSizeMB = 10, allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']) {
        const errors = [];

        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            errors.push(`File size must be less than ${maxSizeMB}MB`);
        }

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            errors.push('Only PDF, text, and Word documents are allowed');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static getFileIcon(fileType) {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word')) return '📝';
        if (fileType.includes('text')) return '📃';
        return '📁';
    }
}

// Form validation utilities
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePassword(password) {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        return {
            valid: minLength && hasUpper && hasLower && hasNumber,
            errors: [
                !minLength && 'Password must be at least 8 characters long',
                !hasUpper && 'Password must contain at least one uppercase letter',
                !hasLower && 'Password must contain at least one lowercase letter',
                !hasNumber && 'Password must contain at least one number'
            ].filter(Boolean)
        };
    }

    static validateStudentId(studentId) {
        const re = /^\d{7}$/; // 7 digits for CUET student ID
        return re.test(studentId);
    }

    static validateISBN(isbn) {
        // Check if it's a valid integer within range
        const num = parseInt(isbn);
        return !isNaN(num) && num > 0 && num <= 2147483647;
    }
}

// Export for use in other files
window.ApiService = ApiService;
window.LoadingManager = LoadingManager;
window.NotificationManager = NotificationManager;
window.FileUtils = FileUtils;
window.FormValidator = FormValidator;

// Alias for backward compatibility with existing code
window.LibraryApiService = ApiService;

// Global notification function for backward compatibility
window.showNotification = NotificationManager.show.bind(NotificationManager);
