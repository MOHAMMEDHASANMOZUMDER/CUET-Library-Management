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
    try {
        // First try the available-only endpoint
        let resp = await fetch('/api/books/available');
        if (!resp.ok) throw new Error('Failed to load available books');
        let data = await resp.json();

        // If empty, fall back to all books (paged)
        if (!Array.isArray(data) || data.length === 0) {
            resp = await fetch('/api/books?page=0&size=100');
            if (resp.ok) {
                const paged = await resp.json();
                data = Array.isArray(paged) ? paged : (paged && paged.content) ? paged.content : [];
            }
        }

        // If still empty, inject default demo catalog
        if (!Array.isArray(data) || data.length === 0) {
            data = getDefaultCatalog();
        }

        books = normalizeBooks(data || []);
        renderBooks(books);
        updateResultsCount(books.length);
    } catch (e) {
        console.error(e);
        const container = document.getElementById('books-container');
        if (container) container.innerHTML = `<p>Failed to load books.</p>`;
        updateResultsCount(0);
    }
}

function normalizeBooks(list) {
    return (list || []).map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        status: b.status ? String(b.status).toLowerCase() : (Number(b.availableCopies) > 0 ? 'available' : 'borrowed'),
        availableCopies: b.availableCopies,
        totalCopies: b.totalCopies,
        image: b.image || 'images/book-placeholder.png'
    }));
}

// Default demo catalog for first-run experience
function getDefaultCatalog() {
    return [
        { id: 1, title: 'Database Management Systems', author: 'Raghu Ramakrishnan', edition: '3rd Edition', department: 'CSE Department', isbn: '978-0072465631', location: 'CS-245', status: 'available', availableCopies: 3, totalCopies: 5, image: 'images/dbms.jpg' },
        { id: 2, title: 'Algorithms', author: 'Robert Sedgewick', edition: '4th Edition', department: 'CSE Department', isbn: '978-0321573513', location: 'CS-156', status: 'borrowed', availableCopies: 0, totalCopies: 5, image: 'images/algorithm.png' },
        { id: 3, title: 'Computer Networks', author: 'Andrew S. Tanenbaum', edition: '5th Edition', department: 'CSE Department', isbn: '978-0132126953', location: 'CS-302', status: 'available', availableCopies: 2, totalCopies: 6, image: 'images/net.jpg' },
        { id: 4, title: 'Software Engineering', author: 'Ian Sommerville', edition: '10th Edition', department: 'CSE Department', isbn: '978-0133943030', location: 'CS-401', status: 'available', availableCopies: 5, totalCopies: 10, image: 'images/se.jpg' },
        { id: 5, title: 'Fundamentals of Electric Circuits', author: 'Charles Alexander', edition: '6th Edition', department: 'EEE Department', isbn: '978-0078028229', location: 'EE-101', status: 'available', availableCopies: 3, totalCopies: 4, image: 'images/ec.jpg' },
        { id: 6, title: 'Thermodynamics: An Engineering Approach', author: 'Yunus Cengel', edition: '8th Edition', department: 'ME Department', isbn: '978-0073398174', location: 'ME-205', status: 'borrowed', availableCopies: 0, totalCopies: 5, image: 'images/td.jpg' },
        { id: 7, title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', edition: '4th Edition', department: 'CSE Department', isbn: '978-0134610996', location: 'CS-101', status: 'borrowed', availableCopies: 0, totalCopies: 4, image: 'images/ArtificialIntelligenceAModernApproach.jpg' },
        { id: 8, title: 'Pattern Recognition and Machine Learning', author: 'Christopher Bishop', edition: '3rd Edition', department: 'CSE Department', isbn: '978-0262033880', location: 'CS-102', status: 'available', availableCopies: 3, totalCopies: 7, image: 'images/Pattern Recognition and Machine Learning.jpg' },
        { id: 9, title: 'Renewable Energy Engineering', author: 'Nicholas Jenkins', edition: '7th Edition', department: 'EEE Department', isbn: '978-0262035613', location: 'EE-101', status: 'available', availableCopies: 3, totalCopies: 4, image: 'images/Renewable Energy Engineering.jpg' },
        { id: 10, title: 'Digital Signal Processing', author: 'John G. Proakis', edition: '5th Edition', department: 'EEE Department', isbn: '978-0073662028', location: 'EE-102', status: 'available', availableCopies: 4, totalCopies: 5, image: 'images/dsp.jpg' },
        { id: 11, title: 'Advanced Engineering Mathematics', author: 'H. K. Das', edition: '1st Edition', department: 'Math Department', isbn: '978-0070635468', location: 'M-101', status: 'available', availableCopies: 5, totalCopies: 8, image: 'images/Engineering Mathematics by H K DAS.jpg' },
        { id: 12, title: 'Advanced Materials and Manufacturing', author: 'Mikel P. Groover', edition: '2nd Edition', department: 'ME Department', isbn: '978-0131118928', location: 'ME-201', status: 'available', availableCopies: 8, totalCopies: 10, image: 'images/Advanced Materials and Manufacturing.jpg' },
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
                    <span class="book-copies">Available: ${book.availableCopies || 0}/${book.totalCopies || 1} copies</span>
                </div>
            </div>
            <div class="book-actions">
                <button class="btn btn-primary" ${book.status !== 'available' ? 'disabled' : ''} onclick="reserveBook(${book.id})">
                    <i data-lucide="calendar"></i>
                    ${getReserveButtonText(book.status)}
                </button>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
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

async function reserveBook(bookId) {
    if (!confirm('Do you want to pre-book this book?')) return;
    try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`/api/prebooks?bookId=${encodeURIComponent(bookId)}`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!resp.ok) throw new Error(await resp.text());
        alert('Pre-book request submitted.');
        await loadBooks();
    } catch (e) {
        alert(e.message || 'Failed to pre-book');
    }
}

// --- Admin Functions ---

function showAddBookModal() {
    const modal = document.getElementById('add-book-modal');
    if (modal) modal.style.display = 'block';
}

function closeAddBookModal() {
    const modal = document.getElementById('add-book-modal');
    if (modal) {
        modal.style.display = 'none';
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

function viewDetails(bookId) {
    console.log('Viewing details for book:', bookId);
}
