// Books JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    // Load books on page load
    loadBooks();
});

function searchBooks() {
    const searchInput = document.getElementById('search-input').value;
    const departmentFilter = document.getElementById('department-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    
    // Mock search functionality - replace with actual API call
    console.log('Searching books:', {
        query: searchInput,
        department: departmentFilter,
        category: categoryFilter
    });
    
    // For now, just reload the same books
    loadBooks();
}

function loadBooks() {
    // Mock books data - replace with actual API call
    const books = [
        {
            id: 1,
            title: 'Database Management Systems',
            author: 'Raghu Ramakrishnan',
            edition: '3rd Edition',
            department: 'CSE Department',
            isbn: '978-0072465631',
            location: 'CS-245',
            status: 'available',
            image: 'https://via.placeholder.com/150x200?text=Database+Systems'
        },
        {
            id: 2,
            title: 'Data Structures and Algorithms in Java',
            author: 'Robert Sedgewick',
            edition: '4th Edition',
            department: 'CSE Department',
            isbn: '978-0321573513',
            location: 'CS-156',
            status: 'borrowed',
            image: 'https://via.placeholder.com/150x200?text=Data+Structures'
        },
        {
            id: 3,
            title: 'Computer Networks',
            author: 'Andrew S. Tanenbaum',
            edition: '5th Edition',
            department: 'CSE Department',
            isbn: '978-0132126953',
            location: 'CS-302',
            status: 'available',
            image: 'https://via.placeholder.com/150x200?text=Computer+Networks'
        },
        {
            id: 4,
            title: 'Software Engineering',
            author: 'Ian Sommerville',
            edition: '10th Edition',
            department: 'CSE Department',
            isbn: '978-0133943030',
            location: 'CS-401',
            status: 'available',
            image: 'https://via.placeholder.com/150x200?text=Software+Engineering'
        },
        {
            id: 5,
            title: 'Fundamentals of Electric Circuits',
            author: 'Charles Alexander',
            edition: '6th Edition',
            department: 'EEE Department',
            isbn: '978-0078028229',
            location: 'EE-101',
            status: 'available',
            image: 'https://via.placeholder.com/150x200?text=Circuit+Analysis'
        },
        {
            id: 6,
            title: 'Thermodynamics: An Engineering Approach',
            author: 'Yunus Cengel',
            edition: '8th Edition',
            department: 'ME Department',
            isbn: '978-0073398174',
            location: 'ME-205',
            status: 'reserved',
            image: 'https://via.placeholder.com/150x200?text=Thermodynamics'
        }
    ];
    
    renderBooks(books);
    updateResultsCount(books.length);
}

function renderBooks(books) {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;
    
    booksContainer.innerHTML = books.map(book => `
        <div class="book-card">
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}">
                <div class="book-status ${book.status}">${getStatusText(book.status)}</div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <p class="book-details">${book.edition} • ${book.department}</p>
                <div class="book-meta">
                    <span class="book-isbn">ISBN: ${book.isbn}</span>
                    <span class="book-location">Shelf: ${book.location}</span>
                </div>
            </div>
            <div class="book-actions">
                <button class="btn btn-primary" ${book.status !== 'available' ? 'disabled' : ''} onclick="reserveBook(${book.id})">
                    <i data-lucide="calendar"></i>
                    ${getReserveButtonText(book.status)}
                </button>
                <button class="btn btn-outline" onclick="viewDetails(${book.id})">
                    <i data-lucide="info"></i>
                    Details
                </button>
            </div>
        </div>
    `).join('');
    
    // Reinitialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function getStatusText(status) {
    switch (status) {
        case 'available': return 'Available';
        case 'borrowed': return 'Borrowed';
        case 'reserved': return 'Reserved';
        default: return 'Unknown';
    }
}

function getReserveButtonText(status) {
    switch (status) {
        case 'available': return 'Reserve';
        case 'borrowed': return 'Unavailable';
        case 'reserved': return 'Reserved';
        default: return 'Reserve';
    }
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${count} of ${count} books`;
    }
}

function reserveBook(bookId) {
    // Mock reservation - replace with actual API call
    console.log('Reserving book:', bookId);
    
    // Show confirmation
    if (confirm('Do you want to reserve this book?')) {
        alert('Book reserved successfully! You will be notified when it\'s ready for pickup.');
        
        // Reload books to reflect new status
        loadBooks();
    }
}

function viewDetails(bookId) {
    // Mock book details - replace with actual API call
    console.log('Viewing details for book:', bookId);
    
    // For now, just show an alert
    alert('Book details will be displayed in a modal. This feature is coming soon!');
}