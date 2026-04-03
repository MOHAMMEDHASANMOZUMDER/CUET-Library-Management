// Enhanced Books JavaScript with full CRUD operations
let books = [];
let currentUser = null;
let isAdmin = false;

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!LibraryApiService.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // Get user info
    isAdmin = LibraryApiService.isAdmin();
    
    // Initialize page
    await loadBooks();
    setupEventListeners();
    
    // Show admin controls if user is admin
    if (isAdmin) {
        showAdminControls();
    }
});

async function loadBooks() {
    try {
        showLoading(true);
        console.log('Loading books from API...');
        
        // Try to get available books first
        let booksData = await LibraryApiService.getAvailableBooks();
        
        // If no available books, get all books
        if (!booksData || booksData.length === 0) {
            console.log('No available books, loading all books...');
            booksData = await LibraryApiService.getBooks(0, 100);
        }
        
        books = booksData || [];
        console.log(`Loaded ${books.length} books from API`);
        
        renderBooks(books);
        updateResultsCount(books.length);
        
    } catch (error) {
        console.error('Error loading books:', error);
        showNotification('Failed to load books: ' + LibraryApiService.handleApiError(error), 'error');
        
        // Fallback to demo data
        books = getDefaultCatalog();
        renderBooks(books);
        updateResultsCount(books.length);
    } finally {
        showLoading(false);
    }
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // Filter functionality
    const departmentFilter = document.getElementById('department-filter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', handleFilter);
    }
    
    // Add book form (admin only)
    const addBookForm = document.getElementById('add-book-form');
    if (addBookForm && isAdmin) {
        addBookForm.addEventListener('submit', handleAddBook);
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadBooks);
    }
}

async function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (!query) {
        renderBooks(books);
        updateResultsCount(books.length);
        return;
    }
    
    try {
        showLoading(true);
        const searchResults = await LibraryApiService.searchBooks(query);
        renderBooks(searchResults);
        updateResultsCount(searchResults.length);
    } catch (error) {
        console.error('Search error:', error);
        // Fallback to local search
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            (book.category && book.category.toLowerCase().includes(query.toLowerCase()))
        );
        renderBooks(filteredBooks);
        updateResultsCount(filteredBooks.length);
    } finally {
        showLoading(false);
    }
}

function handleFilter() {
    const departmentFilter = document.getElementById('department-filter');
    const selectedCategory = departmentFilter.value;
    
    if (!selectedCategory || selectedCategory === 'all') {
        renderBooks(books);
        updateResultsCount(books.length);
        return;
    }
    
    const filteredBooks = books.filter(book => 
        book.category && book.category.toLowerCase() === selectedCategory.toLowerCase()
    );
    
    renderBooks(filteredBooks);
    updateResultsCount(filteredBooks.length);
}

function renderBooks(booksToRender) {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;
    
    if (!booksToRender || booksToRender.length === 0) {
        booksContainer.innerHTML = `
            <div class="no-books">
                <i data-lucide="book-x"></i>
                <p>No books found</p>
            </div>
        `;
        return;
    }
    
    booksContainer.innerHTML = booksToRender.map(book => `
        <div class="book-card" data-book-id="${book.bookId || book.id}">
            <div class="book-image">
                <img src="${book.image || 'images/book-placeholder.png'}" alt="${book.title}" onerror="this.src='images/book-placeholder.png'">
                <div class="book-status ${getStatusClass(book)}">${getStatusText(book)}</div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-author">by ${escapeHtml(book.author)}</p>
                <div class="book-meta">
                    <span class="book-isbn">ISBN: ${book.isbn}</span>
                    <span class="book-copies">Available: ${book.availableCopies || 0}/${book.totalCopies || 1}</span>
                    ${book.category ? `<span class="book-category">${escapeHtml(book.category)}</span>` : ''}
                </div>
            </div>
            <div class="book-actions">
                ${renderBookActions(book)}
            </div>
        </div>
    `).join('');
    
    // Re-initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function renderBookActions(book) {
    const isAvailable = (book.availableCopies || 0) > 0;
    const bookId = book.bookId || book.id;
    
    let actions = '';
    
    if (LibraryApiService.isAuthenticated() && !isAdmin) {
        // Student actions
        if (isAvailable) {
            actions += `
                <button class="btn btn-primary" onclick="requestBook(${bookId}, '${escapeHtml(book.title)}')">
                    <i data-lucide="book-plus"></i>
                    Request Book
                </button>
            `;
        } else {
            actions += `
                <button class="btn btn-outline" disabled>
                    <i data-lucide="clock"></i>
                    Not Available
                </button>
            `;
        }
    } else if (!LibraryApiService.isAuthenticated()) {
        // Not logged in
        actions += `
            <a href="login.html" class="btn btn-primary">
                <i data-lucide="log-in"></i>
                Login to Request
            </a>
        `;
    } else if (isAdmin) {
        // Admin actions
        actions += `
            <button class="btn btn-outline" onclick="editBook(${bookId})">
                <i data-lucide="edit"></i>
                Edit
            </button>
            <button class="btn btn-danger" onclick="deleteBook(${bookId}, '${escapeHtml(book.title)}')">
                <i data-lucide="trash-2"></i>
                Delete
            </button>
        `;
    }
    
    return actions;
}

// Book request functionality
async function requestBook(bookId, bookTitle) {
    try {
        showLoading(true);
        await LibraryApiService.createPreBookRequest(bookId);
        showNotification(`Successfully requested "${bookTitle}"!`, 'success');
        await loadBooks(); // Refresh to show updated availability
    } catch (error) {
        console.error('Request book error:', error);
        showNotification('Failed to request book: ' + LibraryApiService.handleApiError(error), 'error');
    } finally {
        showLoading(false);
    }
}

// Admin book management
async function editBook(bookId) {
    try {
        const book = await LibraryApiService.getBookById(bookId);
        showEditBookModal(book);
    } catch (error) {
        console.error('Edit book error:', error);
        showNotification('Failed to load book details: ' + LibraryApiService.handleApiError(error), 'error');
    }
}

async function deleteBook(bookId, bookTitle) {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        showLoading(true);
        await LibraryApiService.deleteBook(bookId);
        showNotification(`Successfully deleted "${bookTitle}"`, 'success');
        await loadBooks(); // Refresh the list
    } catch (error) {
        console.error('Delete book error:', error);
        showNotification('Failed to delete book: ' + LibraryApiService.handleApiError(error), 'error');
    } finally {
        showLoading(false);
    }
}

async function handleAddBook(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const bookData = {
        isbn: parseInt(formData.get('isbn')),
        title: formData.get('title'),
        author: formData.get('author'),
        category: formData.get('category'),
        totalCopies: parseInt(formData.get('totalCopies')),
        availableCopies: parseInt(formData.get('availableCopies'))
    };
    
    try {
        showLoading(true);
        await LibraryApiService.createBook(bookData);
        showNotification(`Successfully added "${bookData.title}"!`, 'success');
        event.target.reset();
        await loadBooks(); // Refresh the list
    } catch (error) {
        console.error('Add book error:', error);
        showNotification('Failed to add book: ' + LibraryApiService.handleApiError(error), 'error');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function showAdminControls() {
    const adminControls = document.querySelectorAll('.admin-only');
    adminControls.forEach(control => {
        control.style.display = 'block';
    });
}

function getStatusClass(book) {
    const available = (book.availableCopies || 0) > 0;
    return available ? 'available' : 'unavailable';
}

function getStatusText(book) {
    const available = (book.availableCopies || 0) > 0;
    return available ? 'Available' : 'Not Available';
}

function updateResultsCount(count) {
    const resultCount = document.getElementById('results-count');
    if (resultCount) {
        resultCount.textContent = `${count} book${count !== 1 ? 's' : ''} found`;
    }
}

function showLoading(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success': notification.style.backgroundColor = '#10b981'; break;
        case 'error': notification.style.backgroundColor = '#ef4444'; break;
        case 'warning': notification.style.backgroundColor = '#f59e0b'; break;
        default: notification.style.backgroundColor = '#3b82f6';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Default catalog for fallback
function getDefaultCatalog() {
    return [
        { bookId: 1, isbn: 9780134685991, title: 'Effective Java', author: 'Joshua Bloch', category: 'Programming', totalCopies: 5, availableCopies: 3, image: 'images/effective-java.jpg' },
        { bookId: 2, isbn: 9780596009205, title: 'Head First Design Patterns', author: 'Eric Freeman', category: 'Programming', totalCopies: 3, availableCopies: 2, image: 'images/design-patterns.jpg' },
        { bookId: 3, isbn: 9780132126953, title: 'Computer Networks', author: 'Andrew S. Tanenbaum', category: 'Computer Science', totalCopies: 6, availableCopies: 4, image: 'images/networks.jpg' },
        { bookId: 4, isbn: 9780133943030, title: 'Software Engineering', author: 'Ian Sommerville', category: 'Programming', totalCopies: 10, availableCopies: 7, image: 'images/software-eng.jpg' },
        { bookId: 5, isbn: 9780262033848, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', totalCopies: 8, availableCopies: 5, image: 'images/algorithms.jpg' }
    ];
}
