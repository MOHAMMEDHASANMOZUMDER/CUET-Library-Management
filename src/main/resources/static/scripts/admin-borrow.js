// Admin Borrow Management JavaScript
// Handles all borrow-related API interactions and UI updates

let allBorrowRecords = [];
let filteredRecords = [];

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// Initialize the page
async function initializePage() {
    try {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Load initial data
        await loadBorrowRecords();
        await loadBorrowStatistics();
        await loadUsers();
        await loadBooks();

        // Set up event listeners
        setupEventListeners();

        console.log('Admin Borrow page initialized successfully');
    } catch (error) {
        console.error('Error initializing page:', error);
        showNotification('Error loading page. Please refresh.', 'error');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('borrowSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterBorrows();
        });
    }

    // Book selection in modal - properly attach the event listener
    const bookSelect = document.getElementById('borrowBookId');
    if (bookSelect) {
        bookSelect.addEventListener('change', function() {
            const copySelect = document.getElementById('borrowCopyId');
            if (this.value) {
                copySelect.disabled = false;
                loadAvailableCopies();
            } else {
                copySelect.disabled = true;
                copySelect.innerHTML = '<option value="">First select a book...</option>';
            }
        });
    }

    // Borrow date change - auto-calculate due date
    const borrowDateInput = document.getElementById('borrowDate');
    if (borrowDateInput) {
        borrowDateInput.addEventListener('change', function() {
            calculateDueDate();
        });
    }

    // Close modal on backdrop click
    const modalBackdrop = document.getElementById('addBorrowModal');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', function(e) {
            if (e.target === modalBackdrop) {
                closeAddBorrowModal();
            }
        });
    }

    // Close view modal on backdrop click
    const viewModalBackdrop = document.getElementById('viewBorrowModal');
    if (viewModalBackdrop) {
        viewModalBackdrop.addEventListener('click', function(e) {
            if (e.target === viewModalBackdrop) {
                closeViewBorrowModal();
            }
        });
    }

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const addModal = document.getElementById('addBorrowModal');
            const viewModal = document.getElementById('viewBorrowModal');
            
            if (addModal && addModal.classList.contains('active')) {
                closeAddBorrowModal();
            } else if (viewModal && viewModal.classList.contains('active')) {
                closeViewBorrowModal();
            }
        }
    });
}

// Calculate due date (30 days after borrow date)
function calculateDueDate() {
    const borrowDateInput = document.getElementById('borrowDate');
    const dueDateInput = document.getElementById('dueDate');
    
    if (borrowDateInput.value) {
        // Parse date without timezone issues
        const [year, month, day] = borrowDateInput.value.split('-').map(Number);
        const borrowDate = new Date(year, month - 1, day);
        
        // Add 30 days
        borrowDate.setDate(borrowDate.getDate() + 30);
        
        // Format date as YYYY-MM-DD
        const dueYear = borrowDate.getFullYear();
        const dueMonth = String(borrowDate.getMonth() + 1).padStart(2, '0');
        const dueDay = String(borrowDate.getDate()).padStart(2, '0');
        
        dueDateInput.value = `${dueYear}-${dueMonth}-${dueDay}`;
        
        console.log('Borrow Date:', borrowDateInput.value);
        console.log('Due Date:', dueDateInput.value);
    }
}

// Filter borrow records based on search and filters
function filterBorrowRecords() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const userFilter = document.getElementById('userFilter')?.value || 'all';

    filteredRecords = allBorrowRecords.filter(record => {
        // Search filter
        const matchesSearch = !searchTerm || 
            record.user?.name.toLowerCase().includes(searchTerm) ||
            record.user?.email.toLowerCase().includes(searchTerm) ||
            record.book?.title.toLowerCase().includes(searchTerm) ||
            record.id.toString().includes(searchTerm);

        // Status filter
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

        // User filter
        const matchesUser = userFilter === 'all' || record.user?.id.toString() === userFilter;

        return matchesSearch && matchesStatus && matchesUser;
    });

    displayBorrowRecords(filteredRecords);
}

// Load users from database
async function loadUsers() {
    try {
        const headers = getAuthHeaders();
        const response = await fetch('/api/users/all', {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        const userSelect = document.getElementById('borrowUserId');

        // Clear existing options except the first one
        userSelect.innerHTML = '<option value="">Choose a user...</option>';

        // Add users to dropdown
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.email}) - ID: ${user.id}`;
            userSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users list', 'error');
    }
}

// Load books from database
async function loadBooks() {
    try {
        const headers = getAuthHeaders();
        const response = await fetch('/api/books/all', {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const books = await response.json();
        const bookSelect = document.getElementById('borrowBookId');

        // Clear existing options except the first one
        bookSelect.innerHTML = '<option value="">Choose a book...</option>';

        // Add books to dropdown
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.bookId;
            option.textContent = `${book.title} by ${book.author} (ISBN: ${book.isbn}) - ID: ${book.bookId}`;
            option.dataset.isbn = book.isbn;
            bookSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading books:', error);
        showNotification('Error loading books list', 'error');
    }
}

// Load available copies for selected book
async function loadAvailableCopies() {
    const bookSelect = document.getElementById('borrowBookId');
    const copySelect = document.getElementById('borrowCopyId');
    const loadingIndicator = document.getElementById('copyLoadingIndicator');
    const selectedBookId = bookSelect.value;

    if (!selectedBookId) {
        copySelect.innerHTML = '<option value="">First select a book...</option>';
        copySelect.disabled = true;
        return;
    }

    // Show loading state
    if (loadingIndicator) {
        loadingIndicator.classList.add('active');
    }
    copySelect.disabled = true;
    copySelect.innerHTML = '<option value="">Loading copies...</option>';

    try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/books/${selectedBookId}/copies/available`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const copies = await response.json();
        console.log('Available copies loaded:', copies);

        // Clear existing options
        copySelect.innerHTML = '';

        if (!copies || copies.length === 0) {
            copySelect.innerHTML = '<option value="">No available copies</option>';
            copySelect.disabled = true;
            showNotification('No available copies for this book', 'warning');
            return;
        }

        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Choose a copy...';
        copySelect.appendChild(placeholderOption);

        // Add available copies to dropdown
        copies.forEach(copy => {
            const option = document.createElement('option');
            option.value = copy.copyId;
            option.textContent = `Copy #${copy.copyId} - ${copy.status} - Location: ${copy.location || 'N/A'}`;
            copySelect.appendChild(option);
        });

        copySelect.disabled = false;
        showNotification(`${copies.length} available copy/copies loaded`, 'success');

    } catch (error) {
        console.error('Error loading copies:', error);
        showNotification('Error loading available copies', 'error');
        copySelect.innerHTML = '<option value="">Error loading copies</option>';
        copySelect.disabled = true;
    } finally {
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.classList.remove('active');
        }
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// Utility function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// ==================== API FUNCTIONS ====================

// Get all borrow records
async function getAllBorrowRecords() {
    try {
        const headers = getAuthHeaders();
        const response = await fetch('/api/borrow/admin/all?status=ACTIVE', {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const borrowRecords = await response.json();
        return borrowRecords;
    } catch (error) {
        console.error('Error fetching borrow records:', error);
        throw error;
    }
}

// Get borrow statistics
async function getBorrowStatistics() {
    try {
        const headers = getAuthHeaders();

        // Get active borrow count
        const activeResponse = await fetch('/api/borrow/stats/active', {
            method: 'GET',
            headers
        });

        // Get overdue records
        const overdueResponse = await fetch('/api/borrow/overdue', {
            method: 'GET',
            headers
        });

        const activeCount = activeResponse.ok ? await activeResponse.json() : 0;
        const overdueRecords = overdueResponse.ok ? await overdueResponse.json() : [];

        // Calculate returned today
        const today = new Date().toISOString().split('T')[0];
        const returnedToday = allBorrowRecords.filter(record =>
            record.returnDate && record.returnDate.startsWith(today)
        ).length;

        return {
            activeBorrows: activeCount,
            overdue: overdueRecords.length,
            returnedToday: returnedToday
        };
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return { activeBorrows: 0, overdue: 0, returnedToday: 0 };
    }
}

// Add manual borrow record
async function addManualBorrow(userId, bookId, notes = '') {
    try {
        const headers = getAuthHeaders();
        const response = await fetch('/api/borrow/manual', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                userId: parseInt(userId),
                bookId: parseInt(bookId)
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const borrowRecord = await response.json();
        return borrowRecord;
    } catch (error) {
        console.error('Error adding manual borrow:', error);
        throw error;
    }
}

// Return a book
async function returnBook(borrowRecordId) {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/borrow/return/${borrowRecordId}`, {
            method: 'PUT',
            headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error returning book:', error);
        throw error;
    }
}

// ==================== UI FUNCTIONS ====================

// Load and display borrow records
async function loadBorrowRecords() {
    try {
        showLoading('Loading borrow records...');

        const records = await getAllBorrowRecords();
        allBorrowRecords = records;
        filteredRecords = [...records];

        displayBorrowRecords(filteredRecords);
        hideLoading();

    } catch (error) {
        hideLoading();
        showNotification('Error loading borrow records', 'error');
    }
}

// Display borrow records in table
function displayBorrowRecords(records) {
    const tableBody = document.getElementById('borrowTableBody');

    if (records.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">
                    <i data-lucide="book-x"></i>
                    <div style="margin-top:8px">No borrow records found</div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = records.map(record => createBorrowRecordRow(record)).join('');
    lucide.createIcons(); // Re-initialize icons for new content
}

// Create table row for borrow record
function createBorrowRecordRow(record) {
    return `
        <tr>
            <td>${record.userName}</td>
            <td>${record.bookTitle}</td>
            <td>${record.copyId || 'N/A'}</td>
            <td>${formatDate(record.borrowDate)}</td>
            <td>${formatDate(record.dueDate)}</td>
            <td>${formatDate(record.returnDate) || '-'}</td>
            <td>${record.extendedCount !== undefined && record.extendedCount !== null ? record.extendedCount : 0}</td>
            <td class="actions">
                <button onclick="viewBorrowDetails(${record.id})" class="btn btn-small btn-ghost">
                    <i data-lucide="eye"></i>
                    View
                </button>
                ${record.status === 'ACTIVE' ?
                    `<button onclick="returnBookPrompt(${record.id})" class="btn btn-small btn-primary">
                        <i data-lucide="check-circle"></i>
                        Return
                    </button>` : ''
                }
                <button onclick="deleteBorrowRecordPrompt(${record.id})" class="btn btn-small btn-danger">
                    <i data-lucide="trash-2"></i>
                    Delete
                </button>
            </td>
        </tr>
    `;
}

// Load and display statistics
async function loadBorrowStatistics() {
    try {
        const stats = await getBorrowStatistics();

        document.getElementById('activeBorrowsCount').textContent = stats.activeBorrows;
        document.getElementById('overdueCount').textContent = stats.overdue;
        document.getElementById('returnedTodayCount').textContent = stats.returnedToday;

    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Set up search functionality
function setupSearch() {
    const searchInput = document.getElementById('borrowSearch');

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterBorrows(searchTerm);
    });
}

// Filter borrow records
function filterBorrows(searchTerm = '') {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    let filtered = allBorrowRecords;

    // Apply status filter
    if (statusFilter !== 'all') {
        filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        filtered = filtered.filter(record => {
            const borrowDate = new Date(record.borrowDate);

            switch(dateFilter) {
                case 'today':
                    return borrowDate.toDateString() === today.toDateString();
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    return borrowDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(today.getMonth() - 1);
                    return borrowDate >= monthAgo;
                default:
                    return true;
            }
        });
    }

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(record =>
            record.userName.toLowerCase().includes(searchTerm) ||
            record.bookTitle.toLowerCase().includes(searchTerm) ||
            record.bookAuthor.toLowerCase().includes(searchTerm) ||
            (record.copyId && record.copyId.toLowerCase().includes(searchTerm)) ||
            record.isbn.toString().includes(searchTerm)
        );
    }

    filteredRecords = filtered;
    displayBorrowRecords(filteredRecords);
}

// Clear all filters
function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('borrowSearch').value = '';

    filteredRecords = [...allBorrowRecords];
    displayBorrowRecords(filteredRecords);
}

// ==================== MODAL FUNCTIONS ====================

// Open add borrow modal
function openAddBorrowModal() {
    const modal = document.getElementById('addBorrowModal');
    modal.classList.add('active');
    
    // Scroll modal container to top
    const modalContainer = modal.querySelector('.borrow-modal-container');
    if (modalContainer) {
        modalContainer.scrollTop = 0;
    }
    
    // Scroll overlay to top
    modal.scrollTop = 0;
    
    // Reset form
    const form = document.getElementById('addBorrowForm');
    if (form) {
        form.reset();
    }

    // Set today's date as default borrow date
    const borrowDateInput = document.getElementById('borrowDate');
    if (borrowDateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        borrowDateInput.value = `${year}-${month}-${day}`;
        
        // Calculate due date
        calculateDueDate();
    }

    // Reset copy select
    const copySelect = document.getElementById('borrowCopyId');
    if (copySelect) {
        copySelect.disabled = true;
        copySelect.innerHTML = '<option value="">First select a book...</option>';
    }

    // Load users and books when modal opens
    loadUsers();
    loadBooks();

    // Focus on first field
    setTimeout(() => {
        const userSelect = document.getElementById('borrowUserId');
        if (userSelect) {
            userSelect.focus();
        }
    }, 100);

    // Reinitialize icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Close add borrow modal
function closeAddBorrowModal() {
    const modal = document.getElementById('addBorrowModal');
    modal.classList.remove('active');
    
    // Reset form
    const form = document.getElementById('addBorrowForm');
    if (form) {
        form.reset();
    }

    // Hide loading indicator
    const loadingIndicator = document.getElementById('copyLoadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('active');
    }

    // Reset copy select
    const copySelect = document.getElementById('borrowCopyId');
    if (copySelect) {
        copySelect.disabled = true;
        copySelect.innerHTML = '<option value="">First select a book...</option>';
    }
}

// Add manual borrow record
async function addManualBorrow() {
    const userSelect = document.getElementById('borrowUserId');
    const bookSelect = document.getElementById('borrowBookId');
    const copySelect = document.getElementById('borrowCopyId');
    const borrowDateInput = document.getElementById('borrowDate');
    const dueDateInput = document.getElementById('dueDate');
    const extendedCountInput = document.getElementById('extendedCount');
    const returnDateInput = document.getElementById('returnDate');
    const prebookIdInput = document.getElementById('borrowPrebookId');

    const userId = userSelect.value;
    const bookId = bookSelect.value;
    const copyId = copySelect.value;
    const borrowDate = borrowDateInput.value;
    const dueDate = dueDateInput.value;
    const extendedCount = extendedCountInput.value || 0;
    const returnDate = returnDateInput.value || null;
    const prebookId = prebookIdInput.value || null;

    if (!userId || !bookId || !copyId || !borrowDate || !dueDate) {
        showNotification('Please fill all required fields (User, Book, Copy, Borrow Date)', 'warning');
        return;
    }

    try {
        showLoading('Creating borrow record...');

        // Use the enhanced manual borrow API with new fields
        const borrowRecord = await addManualBorrowWithDetails(
            userId, 
            bookId, 
            copyId, 
            borrowDate, 
            dueDate, 
            extendedCount, 
            returnDate, 
            prebookId
        );

        showNotification('Borrow record created successfully!', 'success');
        closeAddBorrowModal();

        // Refresh data
        await loadBorrowRecords();
        await loadBorrowStatistics();

    } catch (error) {
        showNotification(`Failed to create borrow record: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Enhanced manual borrow with all fields
async function addManualBorrowWithDetails(userId, bookId, copyId, borrowDate, dueDate, extendedCount = 0, returnDate = null, prebookId = null) {
    try {
        const headers = getAuthHeaders();
        const requestBody = {
            userId: parseInt(userId),
            bookId: parseInt(bookId),
            copyId: copyId,
            borrowDate: borrowDate,
            dueDate: dueDate,
            extendedCount: parseInt(extendedCount),
            prebookId: prebookId ? parseInt(prebookId) : null
        };

        // Only include returnDate if it's provided
        if (returnDate) {
            requestBody.returnDate = returnDate;
        }

        const response = await fetch('/api/borrow/manual', {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const borrowRecord = await response.json();
        return borrowRecord;
    } catch (error) {
        console.error('Error adding manual borrow with details:', error);
        throw error;
    }
}

// Return book prompt
async function returnBookPrompt(borrowRecordId) {
    const confirmed = confirm('Are you sure you want to return this book?');

    if (confirmed) {
        try {
            showLoading('Returning book...');

            await returnBook(borrowRecordId);

            showNotification('Book returned successfully!', 'success');

            // Refresh data
            await loadBorrowRecords();
            await loadBorrowStatistics();

        } catch (error) {
            showNotification(`Failed to return book: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    }
}

// ==================== UTILITY FUNCTIONS ====================

// Get status CSS class
function getStatusClass(status) {
    switch(status) {
        case 'ACTIVE': return 'available';
        case 'RETURNED': return 'returned';
        case 'OVERDUE': return 'overdue';
        default: return 'muted';
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show loading indicator
function showLoading(message = 'Loading...') {
    // Implementation for loading spinner
    console.log('Loading:', message);
}

// Hide loading indicator
function hideLoading() {
    // Hide loading spinner
    console.log('Loading complete');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');

    notificationMessage.textContent = message;
    notification.className = `notification notification-${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
}

// Close view borrow modal
function closeViewBorrowModal() {
    const modal = document.getElementById('viewBorrowModal');
    modal.classList.remove('active');
    currentEditingBorrowId = null;
}

// Delete borrow record with confirmation
async function deleteBorrowRecordPrompt(borrowRecordId) {
    const confirmed = confirm('Are you sure you want to delete this borrow record? This action cannot be undone.');

    if (confirmed) {
        try {
            showLoading('Deleting borrow record...');

            await deleteBorrowRecord(borrowRecordId);

            showNotification('Borrow record deleted successfully!', 'success');

            // Refresh data
            await loadBorrowRecords();
            await loadBorrowStatistics();

        } catch (error) {
            showNotification(`Failed to delete borrow record: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    }
}

// Delete borrow record
async function deleteBorrowRecord(borrowRecordId) {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/borrow/${borrowRecordId}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error deleting borrow record:', error);
        throw error;
    }
}

// View borrow details - opens modal with full borrow information and allows editing
let currentEditingBorrowId = null;

function viewBorrowDetails(borrowId) {
    // Find the record in the current data
    const record = allBorrowRecords.find(r => r.id === borrowId);
    
    if (!record) {
        showNotification('Borrow record not found', 'error');
        return;
    }

    // Store the current editing borrow ID
    currentEditingBorrowId = borrowId;

    // Populate modal fields - Read-only info
    document.getElementById('viewBorrowId').textContent = record.id || '-';
    document.getElementById('viewCopyId').textContent = record.copyId || 'N/A';
    
    // User information
    document.getElementById('viewUserId').textContent = record.userId || '-';
    document.getElementById('viewUserName').textContent = record.userName || 'Unknown User';
    document.getElementById('viewUserEmail').textContent = record.userEmail || 'No email available';
    
    // Book information
    document.getElementById('viewBookId').textContent = record.bookId || '-';
    document.getElementById('viewBookTitle').textContent = record.bookTitle || 'Unknown Title';
    document.getElementById('viewBookAuthor').textContent = record.bookAuthor || 'Unknown Author';
    document.getElementById('viewBookIsbn').textContent = record.isbn || 'N/A';
    
    // Display overdue days (auto-calculated, read-only)
    const viewExtensionCount = document.getElementById('viewExtensionCount');
    viewExtensionCount.textContent = record.extendedCount !== undefined && record.extendedCount !== null ? record.extendedCount : 0;
    
    // Editable fields - Dates
    const editBorrowDate = document.getElementById('editBorrowDate');
    const editDueDate = document.getElementById('editDueDate');
    const editReturnDate = document.getElementById('editReturnDate');
    
    // Format dates for input fields (YYYY-MM-DD)
    if (record.borrowDate) {
        editBorrowDate.value = record.borrowDate.split('T')[0];
    }
    if (record.dueDate) {
        editDueDate.value = record.dueDate.split('T')[0];
    }
    if (record.returnDate) {
        editReturnDate.value = record.returnDate.split('T')[0];
    } else {
        editReturnDate.value = '';
    }
    
    // Open modal
    const modal = document.getElementById('viewBorrowModal');
    modal.classList.add('active');
    
    // Scroll to top
    const modalContainer = modal.querySelector('.borrow-modal-container');
    if (modalContainer) {
        modalContainer.scrollTop = 0;
    }
    modal.scrollTop = 0;
    
    // Reinitialize icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Save edited borrow record
async function saveEditedBorrow() {
    if (!currentEditingBorrowId) {
        showNotification('No borrow record selected for editing', 'error');
        return;
    }

    try {
        // Find the original record
        const originalRecord = allBorrowRecords.find(r => r.id === currentEditingBorrowId);
        if (!originalRecord) {
            showNotification('Original record not found', 'error');
            return;
        }

        // Get edited values
        const borrowDate = document.getElementById('editBorrowDate').value;
        const dueDate = document.getElementById('editDueDate').value;
        const returnDate = document.getElementById('editReturnDate').value || null;

        // Validate
        if (!borrowDate || !dueDate) {
            showNotification('Borrow Date and Due Date are required', 'warning');
            return;
        }

        showLoading('Saving changes...');

        // Prepare the update payload - ONLY send the editable fields
        // Note: extendedCount (overdue days) is auto-calculated by backend
        const updatePayload = {
            borrowDate: borrowDate,
            dueDate: dueDate
        };

        // Only include returnDate if it has a value
        if (returnDate) {
            updatePayload.returnDate = returnDate;
        }

        console.log('Update payload:', updatePayload);

        // Call API to update borrow record
        const headers = getAuthHeaders();
        const response = await fetch(`/api/borrow/${currentEditingBorrowId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updatePayload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const updatedRecord = await response.json();
        console.log('Updated record:', updatedRecord);

        showNotification('Borrow record updated successfully!', 'success');
        closeViewBorrowModal();

        // Refresh data
        await loadBorrowRecords();
        await loadBorrowStatistics();

    } catch (error) {
        console.error('Error updating borrow record:', error);
        showNotification(`Failed to update: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Close view borrow modal
function closeViewBorrowModal() {
    const modal = document.getElementById('viewBorrowModal');
    modal.classList.remove('active');
}