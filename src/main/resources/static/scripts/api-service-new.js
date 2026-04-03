// Enhanced API Service with full CRUD operations
class LibraryApiService {
    static BASE_URL = window.location.origin + '/api';
    static TOKEN_KEY = 'token';

    // Authentication methods
    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    static removeToken() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem('userType');
        localStorage.removeItem('library_user_data');
    }

    static getAuthHeaders() {
        const token = this.getToken();
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }

    // Generic request method
    static async request(endpoint, options = {}) {
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            // Handle empty responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // BOOKS API
    static async getBooks(page = 0, size = 100) {
        return this.request(`/books?page=${page}&size=${size}`);
    }

    static async getAvailableBooks() {
        return this.request('/books/available');
    }

    static async getBookById(id) {
        return this.request(`/books/${id}`);
    }

    static async getBookByIsbn(isbn) {
        return this.request(`/books/isbn/${isbn}`);
    }

    static async searchBooks(keyword, page = 0, size = 10) {
        return this.request(`/books/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    }

    static async getBooksByAuthor(author) {
        return this.request(`/books/author/${encodeURIComponent(author)}`);
    }

    static async getBooksByCategory(category) {
        return this.request(`/books/category/${encodeURIComponent(category)}`);
    }

    static async createBook(bookData) {
        return this.request('/books', {
            method: 'POST',
            body: JSON.stringify(bookData)
        });
    }

    static async updateBook(id, bookData) {
        return this.request(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bookData)
        });
    }

    static async deleteBook(id) {
        return this.request(`/books/${id}`, {
            method: 'DELETE'
        });
    }

    static async getBookStats() {
        const [total, available] = await Promise.all([
            this.request('/books/stats/total'),
            this.request('/books/stats/available')
        ]);
        return { total, available };
    }

    // PREBOOK API
    static async getUserPreBooks() {
        return this.request('/prebooks/user');
    }

    static async getAllPreBooks() {
        return this.request('/prebooks/admin/all');
    }

    static async getPreBooksByStatus(status) {
        return this.request(`/prebooks/admin/status/${status}`);
    }

    static async createPreBookRequest(bookId) {
        return this.request('/prebooks/request', {
            method: 'POST',
            body: JSON.stringify({ bookId })
        });
    }

    static async approvePreBook(id, adminNotes = '') {
        return this.request(`/prebooks/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify({ adminNotes })
        });
    }

    static async rejectPreBook(id, adminNotes = '') {
        return this.request(`/prebooks/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ adminNotes })
        });
    }

    static async cancelPreBook(id) {
        return this.request(`/prebooks/${id}/cancel`, {
            method: 'POST'
        });
    }

    static async deletePreBook(id) {
        return this.request(`/prebooks/${id}`, {
            method: 'DELETE'
        });
    }

    // FINES API
    static async getUserFines() {
        return this.request('/fines/user');
    }

    static async getAllFines() {
        return this.request('/fines/admin/all');
    }

    static async getFineById(id) {
        return this.request(`/fines/${id}`);
    }

    static async submitPaymentProof(fineId, trxId) {
        return this.request(`/fines/${fineId}/submit-payment`, {
            method: 'POST',
            body: JSON.stringify({ trXID: trxId })
        });
    }

    static async approvePayment(fineId) {
        return this.request(`/fines/${fineId}/approve-payment`, {
            method: 'POST'
        });
    }

    static async createFine(borrowRecordId, amount) {
        return this.request('/fines/create', {
            method: 'POST',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `borrowRecordId=${borrowRecordId}&amount=${amount}`
        });
    }

    static async deleteFine(id) {
        return this.request(`/fines/${id}`, {
            method: 'DELETE'
        });
    }

    // AUTHENTICATION API
    static async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            this.removeToken();
        }
    }

    // USER API
    static async getCurrentUser() {
        return this.request('/users/me');
    }

    static async getAllUsers() {
        return this.request('/users');
    }

    static async updateUser(id, userData) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // UTILITY METHODS
    static isAuthenticated() {
        return !!this.getToken();
    }

    static getUserType() {
        return localStorage.getItem('userType') || 'student';
    }

    static isAdmin() {
        return this.getUserType() === 'admin';
    }

// Error handling helper
    static handleApiError(error, defaultMessage = 'An error occurred') {
        console.error('API Error:', error);
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            this.removeToken();
            window.location.href = '/login.html';
            return 'Session expired. Please login again.';
        }
        
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
            return 'You do not have permission to perform this action.';
        }
        
        return error.message || defaultMessage;
    }

    // Notification system
    static showNotification(message, type = 'info', duration = 5000) {
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
}

// Export for use in other scripts
window.LibraryApiService = LibraryApiService;
