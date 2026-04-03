// Books JavaScript

let books = [];

document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    // Optional gate: require login for books page
    if (!userType) {
        window.location.href = 'login.html';
        return;
    }

    // Update header auth buttons (hide Login/Register when logged in)
    try {
        const authBtns = document.querySelector('.auth-buttons');
        if (authBtns && token) {
            authBtns.style.display = 'none';
        }
    } catch (_) {}

    // Show Admin controls if user is an admin
    if (userType === 'admin') {
        const adminControls = document.getElementById('admin-controls');
        if (adminControls) adminControls.style.display = 'block';

        const addBookForm = document.getElementById('add-book-form');
        if (addBookForm) {
            addBookForm.addEventListener('submit', handleAddBook);
        }
    }

    await loadBooks();
});

async function loadBooks() {
    console.log('Loading books from API...');
    
    try {
        // First try to get available books
        let resp = await fetch('/api/books/available', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        let data = [];
        
        if (resp.ok) {
            try {
                data = await resp.json();
                console.log('Loaded books from /api/books/available:', data.length);
            } catch (jsonError) {
                console.warn('Failed to parse JSON from /api/books/available:', jsonError);
                data = [];
            }
        } else {
            console.warn('API /api/books/available returned:', resp.status);
        }

        // If empty, fall back to all books (paged)
        if (!Array.isArray(data) || data.length === 0) {
            try {
                resp = await fetch('/api/books?page=0&size=100', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (resp.ok) {
                    data = await resp.json();
                    // The API now returns a direct array of BookDTOs, not a paged response
                    console.log('Loaded books from /api/books:', data.length);
                }
            } catch (jsonError) {
                console.warn('Failed to parse JSON from /api/books:', jsonError);
                data = [];
            }
        }

        // If still empty, inject default demo catalog
        if (!Array.isArray(data) || data.length === 0) {
            console.log('No books from API, using default catalog');
            data = getDefaultCatalog();
        }

        books = normalizeBooks(data || []);
        renderBooks(books);
        updateResultsCount(books.length);
    } catch (e) {
        console.error('Error loading books from API:', e);
        // Fallback to default catalog on any error
        console.log('Falling back to default catalog');
        books = normalizeBooks(getDefaultCatalog());
        renderBooks(books);
        updateResultsCount(books.length);
    }
}

function normalizeBooks(list) {
    return (list || []).map(b => ({
        id: b.bookId || b.id || b.isbn,
        isbn: b.isbn || b.id,
        title: b.title || 'Unknown Title',
        author: b.author || 'Unknown Author',
        category: b.category || 'General',
        status: b.status ? String(b.status).toLowerCase() : (Number(b.availableCopies) > 0 ? 'available' : 'borrowed'),
        availableCopies: b.availableCopies,
        totalCopies: b.totalCopies,
        image: b.image || 'images/book-placeholder.png'
    }));
}

// Default demo catalog for first-run experience
function getDefaultCatalog() {
    return [
        { isbn: '9780072465631', title: 'Database Management Systems', author: 'Raghu Ramakrishnan', edition: '3rd Edition', department: 'CSE Department', location: 'CS-245', status: 'available', availableCopies: 3, totalCopies: 5, image: 'images/dbms.jpg' },
        { isbn: '9780321573513', title: 'Algorithms', author: 'Robert Sedgewick', edition: '4th Edition', department: 'CSE Department', location: 'CS-156', status: 'borrowed', availableCopies: 0, totalCopies: 5, image: 'images/algorithm.png' },
        { isbn: '9780132126953', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', edition: '5th Edition', department: 'CSE Department', location: 'CS-302', status: 'available', availableCopies: 2, totalCopies: 6, image: 'images/net.jpg' },
        { isbn: '9780133943030', title: 'Software Engineering', author: 'Ian Sommerville', edition: '10th Edition', department: 'CSE Department', location: 'CS-401', status: 'available', availableCopies: 5, totalCopies: 10, image: 'images/se.jpg' },
        { isbn: '9780078028229', title: 'Fundamentals of Electric Circuits', author: 'Charles Alexander', edition: '6th Edition', department: 'EEE Department', location: 'EE-101', status: 'available', availableCopies: 3, totalCopies: 4, image: 'images/ec.jpg' },
        { isbn: '9780073398174', title: 'Thermodynamics: An Engineering Approach', author: 'Yunus Cengel', edition: '8th Edition', department: 'ME Department', location: 'ME-205', status: 'borrowed', availableCopies: 0, totalCopies: 5, image: 'images/td.jpg' },
        { isbn: '9780134610996', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', edition: '4th Edition', department: 'CSE Department', location: 'CS-101', status: 'borrowed', availableCopies: 0, totalCopies: 4, image: 'images/ArtificialIntelligenceAModernApproach.jpg' },
        { isbn: '9780262033880', title: 'Pattern Recognition and Machine Learning', author: 'Christopher Bishop', edition: '3rd Edition', department: 'CSE Department', location: 'CS-102', status: 'available', availableCopies: 3, totalCopies: 7, image: 'images/Pattern Recognition and Machine Learning.jpg' },
        { isbn: '9780262035613', title: 'Renewable Energy Engineering', author: 'Nicholas Jenkins', edition: '7th Edition', department: 'EEE Department', location: 'EE-101', status: 'available', availableCopies: 3, totalCopies: 4, image: 'images/Renewable Energy Engineering.jpg' },
        { isbn: '9780073662028', title: 'Digital Signal Processing', author: 'John G. Proakis', edition: '5th Edition', department: 'EEE Department', location: 'EE-102', status: 'available', availableCopies: 4, totalCopies: 5, image: 'images/dsp.jpg' },
        { isbn: '9780070635468', title: 'Advanced Engineering Mathematics', author: 'H. K. Das', edition: '1st Edition', department: 'Math Department', location: 'M-101', status: 'available', availableCopies: 5, totalCopies: 8, image: 'images/Engineering Mathematics by H K DAS.jpg' },
        { isbn: '9780131118928', title: 'Advanced Materials and Manufacturing', author: 'Mikel P. Groover', edition: '2nd Edition', department: 'ME Department', location: 'ME-201', status: 'available', availableCopies: 8, totalCopies: 10, image: 'images/Advanced Materials and Manufacturing.jpg' },
    ];
}

function searchBooks() {
    const searchInput = document.getElementById('search-input').value.toLowerCase().trim();
    const departmentFilter = document.getElementById('department-filter').value.toLowerCase();

    const filteredBooks = books.filter(book => {
        const matchesSearch =
            (book.title || '').toLowerCase().includes(searchInput) ||
            (book.author || '').toLowerCase().includes(searchInput);
        const matchesDepartment = departmentFilter === 'all' || departmentFilter === '' || true;
        return matchesSearch && matchesDepartment;
    });

    renderBooks(filteredBooks);
    updateResultsCount(filteredBooks.length);
}

function renderBooks(booksToRender) {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;
    if (!booksToRender || booksToRender.length === 0) {
        booksContainer.innerHTML = `<p>No books found.</p>`;
        return;
    }

    const isAdmin = (localStorage.getItem('userType') === 'admin');
    const userType = localStorage.getItem('userType');
    const isLoggedIn = !!localStorage.getItem('token');

    booksContainer.innerHTML = booksToRender.map(book => `
        <div class="book-card">
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}">
                <div class="book-status ${book.status}" style="color: ${getStatusColor(book.status)};">${getStatusText(book.status)}</div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author || ''}</p>
                <div class="book-meta">
                    <span class="book-isbn">ISBN: ${book.isbn || book.id}</span>
                    <span class="book-copies">Available: ${book.availableCopies || 0}/${book.totalCopies || 1} copies</span>
                    ${book.category ? `<span class="book-category">Category: ${book.category}</span>` : ''}
                </div>
            </div>
            <div class="book-actions">
                ${isLoggedIn && !isAdmin ? `
                    <button class="btn btn-primary" ${book.status !== 'available' ? 'disabled' : ''} onclick="borrowBook(${book.id || book.isbn}, '${book.title.replace(/'/g, "\\'")}')">
                        <i data-lucide="book-plus"></i>
                        Request Book
                    </button>
                ` : ''}
                ${!isLoggedIn ? `
                    <a href="login.html" class="btn btn-primary">
                        <i data-lucide="log-in"></i>
                        Login to Borrow
                    </a>
                ` : ''}
                ${isAdmin ? `
                    <button class="btn btn-outline" onclick="editBook(${book.isbn || book.id})">
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteBook(${book.isbn || book.id})">
                        <i data-lucide="trash-2"></i>
                        Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

async function deleteBook(bookIsbn) {
    if (!confirm('Delete this book? This cannot be undone.')) return;
    try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`/api/books/${encodeURIComponent(bookIsbn)}`, {
            method: 'DELETE',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!resp.ok) throw new Error(await resp.text());
        showNotification('Book deleted successfully!', 'success');
        await loadBooks();
    } catch (e) {
        console.error('Delete error:', e);
        showNotification(e.message || 'Delete failed', 'error');
    }
}

async function editBook(bookIsbn) {
    try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`/api/books/${encodeURIComponent(bookIsbn)}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!resp.ok) throw new Error('Failed to load book details');
        
        const book = await resp.json();
        showEditBookModal(book);
    } catch (e) {
        console.error('Edit error:', e);
        showNotification(e.message || 'Failed to load book details', 'error');
    }
}

function showEditBookModal(book) {
    // For now, just show an alert with book details
    // In a real implementation, you'd open a modal
    const newTitle = prompt('Edit book title:', book.title);
    if (newTitle && newTitle !== book.title) {
        updateBookTitle(book.isbn, newTitle);
    }
}

// Handle book borrowing/reservation
async function borrowBook(bookId, bookTitle) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to borrow books', 'error');
            return;
        }

        const resp = await fetch('/api/prebooks/request', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: bookId
            })
        });

        if (resp.ok) {
            showNotification(`Book "${bookTitle}" has been requested successfully!`, 'success');
            await loadBooks(); // Refresh the book list
        } else {
            const errorText = await resp.text();
            showNotification(errorText || 'Failed to request book', 'error');
        }
    } catch (e) {
        console.error('Borrow error:', e);
        showNotification('Failed to request book', 'error');
    }
}

// Show notification function
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
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

async function updateBookTitle(bookIsbn, newTitle) {
    try {
        const token = localStorage.getItem('token');
        
        // First get the current book data
        const getResp = await fetch(`/api/books/${encodeURIComponent(bookIsbn)}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!getResp.ok) throw new Error('Failed to load book data');
        const bookData = await getResp.json();
        
        // Update the title
        bookData.title = newTitle;
        
        const updateResp = await fetch(`/api/books/${encodeURIComponent(bookIsbn)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookData)
        });
        
        if (!updateResp.ok) throw new Error(await updateResp.text());
        
        showNotification('Book updated successfully!', 'success');
        await loadBooks();
    } catch (e) {
        console.error('Update error:', e);
        showNotification(e.message || 'Update failed', 'error');
    }
}

function getStatusText(status) {
    switch (status) {
        case 'available': return 'Available';
        case 'borrowed': return 'Unavailable';
        default: return 'Unknown';
    }
}

function getStatusColor(status) {
  switch (status) {
    case 'borrowed': return 'grey';
    case 'available': return 'green';
    default: return 'black';
  }
}

function getReserveButtonText(status) {
    return status === 'available' ? 'Pre-book' : 'Unavailable';
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) resultsCount.textContent = `Showing ${count} book${count !== 1 ? 's' : ''}`;
}

async function reserveBook(bookIsbn) {
    if (!confirm('Do you want to pre-book this book?')) return;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to make a pre-booking.');
            return;
        }
        
        const resp = await fetch(`/api/prebooks?isbn=${encodeURIComponent(bookIsbn)}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!resp.ok) {
            const errorText = await resp.text();
            throw new Error(errorText || 'Failed to pre-book');
        }
        
        alert('Pre-book request submitted successfully!');
        await loadBooks();
    } catch (e) {
        console.error('Pre-book error:', e);
        alert(e.message || 'Failed to pre-book');
    }
}

async function borrowBook(bookIsbn) {
    if (!confirm('Do you want to borrow this book?')) return;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to borrow a book.');
            return;
        }
        
        // Find book by ISBN to get bookId
        const book = allBooks.find(b => b.isbn == bookIsbn);
        if (!book) {
            throw new Error('Book not found');
        }
        
        const resp = await fetch('/api/prebooks/request', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: book.bookId
            })
        });
        
        if (!resp.ok) {
            const errorText = await resp.text();
            throw new Error(errorText || 'Failed to request book');
        }
        
        alert('Book request submitted successfully! Wait for admin approval.');
        await loadBooks();
    } catch (e) {
        console.error('Borrow error:', e);
        alert(e.message || 'Failed to borrow book');
    }
}

// --- Admin Functions ---

function showAddBookModal() {
    const modal = document.getElementById('add-book-modal');
    if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
    }
}

function closeAddBookModal() {
    const modal = document.getElementById('add-book-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        const form = document.getElementById('add-book-form');
        if (form) form.reset();
    }
}

async function handleAddBook(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication error. Please log in again.');
        return;
    }

    const formData = new FormData(event.target);
    const bookData = Object.fromEntries(formData.entries());

    bookData.totalCopies = parseInt(bookData.totalCopies, 10);
    if (isNaN(bookData.totalCopies) || bookData.totalCopies < 1) {
        alert('Total copies must be a positive number.');
        return;
    }
    bookData.availableCopies = bookData.totalCopies;

    try {
        const resp = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookData)
        });

        if (!resp.ok) {
            const errorText = await resp.text();
            throw new Error(errorText || 'Failed to add book.');
        }

        alert('Book added successfully!');
        closeAddBookModal();
        await loadBooks();
    } catch (e) {
        console.error('Error adding book:', e);
        alert(`Error: ${e.message}`);
    }
}

// Expose functions globally for inline handlers in HTML
window.showAddBookModal = showAddBookModal;
window.closeAddBookModal = closeAddBookModal;
window.handleAddBook = handleAddBook;
window.reserveBook = reserveBook;
window.borrowBook = borrowBook;
window.deleteBook = deleteBook;
window.editBook = editBook;

function viewDetails(bookId) {
    console.log('Viewing details for book:', bookId);
}

// Utility function for notifications
function showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        z-index: 9999;
        font-weight: 500;
        ${type === 'success' ? 'background: #10b981;' : ''}
        ${type === 'error' ? 'background: #ef4444;' : ''}
        ${type === 'warning' ? 'background: #f59e0b;' : ''}
        ${type === 'info' ? 'background: #3b82f6;' : ''}
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}
