// My Books JavaScript
let currentRenewalBookId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    const userType = localStorage.getItem('userType');
    if (!userType) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize tabs
    initializeTabs();
    
    // Load books data
    loadMyBooks();
});

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
            
            // Load appropriate content
            switch(targetTab) {
                case 'borrowed':
                    loadBorrowedBooks();
                    break;
                case 'reservations':
                    loadReservations();
                    break;
                case 'history':
                    loadBorrowingHistory();
                    break;
            }
        });
    });
}

function loadMyBooks() {
    loadBorrowedBooks(); // Load default tab
}

function loadBorrowedBooks() {
    // Mock borrowed books data
    const borrowedBooks = [
        {
            id: 1,
            title: 'Database Management Systems',
            author: 'Raghu Ramakrishnan',
            isbn: '978-0072465631',
            borrowDate: '2025-01-05',
            dueDate: '2025-01-19',
            canRenew: true,
            renewalsUsed: 1,
            maxRenewals: 3,
            image: 'https://via.placeholder.com/80x100?text=DB',
            fine: 0,
            status: 'due-soon'
        },
        {
            id: 2,
            title: 'Data Structures and Algorithms',
            author: 'Robert Sedgewick',
            isbn: '978-0321573513',
            borrowDate: '2025-01-02',
            dueDate: '2025-01-16',
            canRenew: true,
            renewalsUsed: 0,
            maxRenewals: 3,
            image: 'https://via.placeholder.com/80x100?text=DSA',
            fine: 0,
            status: 'due-soon'
        },
        {
            id: 3,
            title: 'Computer Networks',
            author: 'Andrew S. Tanenbaum',
            isbn: '978-0132126953',
            borrowDate: '2024-12-20',
            dueDate: '2025-01-03',
            canRenew: false,
            renewalsUsed: 3,
            maxRenewals: 3,
            image: 'https://via.placeholder.com/80x100?text=Networks',
            fine: 50,
            status: 'overdue'
        }
    ];
    
    renderBorrowedBooks(borrowedBooks);
}

function renderBorrowedBooks(books) {
    const container = document.getElementById('borrowed-books');
    if (!container) return;
    
    container.innerHTML = books.map(book => {
        const daysOverdue = book.status === 'overdue' ? Math.ceil((new Date() - new Date(book.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
        const statusClass = book.status === 'overdue' ? 'overdue' : book.status === 'due-soon' ? 'due-soon' : 'normal';
        
        return `
            <div class="borrowed-book-item ${statusClass}">
                <div class="book-image">
                    <img src="${book.image}" alt="${book.title}">
                    ${book.fine > 0 ? `<div class="fine-badge">৳${book.fine}</div>` : ''}
                </div>
                <div class="book-details">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">by ${book.author}</p>
                    <p class="book-isbn">ISBN: ${book.isbn}</p>
                    <div class="book-dates">
                        <div class="date-info">
                            <span class="label">Borrowed:</span>
                            <span class="date">${formatDate(book.borrowDate)}</span>
                        </div>
                        <div class="date-info ${statusClass}">
                            <span class="label">Due:</span>
                            <span class="date">${formatDate(book.dueDate)}</span>
                            ${daysOverdue > 0 ? `<span class="overdue-days">(${daysOverdue} days overdue)</span>` : ''}
                        </div>
                    </div>
                    <div class="renewal-info">
                        <span>Renewals: ${book.renewalsUsed}/${book.maxRenewals}</span>
                        ${book.fine > 0 ? `<span class="fine-amount">Fine: ৳${book.fine}</span>` : ''}
                    </div>
                </div>
                <div class="book-actions">
                    <button class="btn btn-primary" ${!book.canRenew ? 'disabled' : ''} onclick="renewBook(${book.id})">
                        <i data-lucide="refresh-cw"></i>
                        ${book.canRenew ? 'Renew' : 'Cannot Renew'}
                    </button>
                    ${book.fine > 0 ? `
                        <button class="btn btn-danger" onclick="payFine(${book.id})">
                            <i data-lucide="credit-card"></i>
                            Pay Fine (৳${book.fine})
                        </button>
                    ` : ''}
                    <button class="btn btn-outline" onclick="returnBook(${book.id})">
                        <i data-lucide="arrow-left"></i>
                        Return Book
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Reinitialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function loadReservations() {
    // Mock reservations data
    const reservations = [
        {
            id: 4,
            title: 'Software Engineering',
            author: 'Ian Sommerville',
            isbn: '978-0133943030',
            reservedDate: '2025-01-12',
            availableDate: '2025-01-15',
            expiryDate: '2025-01-17',
            status: 'ready',
            image: 'https://via.placeholder.com/80x100?text=SE',
            pickupLocation: 'Main Desk'
        }
    ];
    
    renderReservations(reservations);
}

function renderReservations(reservations) {
    const container = document.getElementById('reserved-books');
    if (!container) return;
    
    if (reservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="calendar-x"></i>
                <h3>No Reservations</h3>
                <p>You don't have any books reserved currently.</p>
                <button class="btn btn-primary" onclick="window.location.href='books.html'">Browse Books</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reservations.map(reservation => `
        <div class="reserved-book-item ${reservation.status}">
            <div class="book-image">
                <img src="${reservation.image}" alt="${reservation.title}">
                <div class="status-badge ${reservation.status}">
                    ${reservation.status === 'ready' ? 'Ready for Pickup' : 'Waiting'}
                </div>
            </div>
            <div class="book-details">
                <h3 class="book-title">${reservation.title}</h3>
                <p class="book-author">by ${reservation.author}</p>
                <p class="book-isbn">ISBN: ${reservation.isbn}</p>
                <div class="reservation-dates">
                    <div class="date-info">
                        <span class="label">Reserved:</span>
                        <span class="date">${formatDate(reservation.reservedDate)}</span>
                    </div>
                    <div class="date-info">
                        <span class="label">Available:</span>
                        <span class="date">${formatDate(reservation.availableDate)}</span>
                    </div>
                    <div class="date-info">
                        <span class="label">Expires:</span>
                        <span class="date">${formatDate(reservation.expiryDate)}</span>
                    </div>
                </div>
                <div class="pickup-info">
                    <span><strong>Pickup Location:</strong> ${reservation.pickupLocation}</span>
                </div>
            </div>
            <div class="book-actions">
                ${reservation.status === 'ready' ? `
                    <button class="btn btn-primary" onclick="confirmPickup(${reservation.id})">
                        <i data-lucide="check"></i>
                        Mark as Picked Up
                    </button>
                ` : ''}
                <button class="btn btn-outline" onclick="cancelReservation(${reservation.id})">
                    <i data-lucide="x"></i>
                    Cancel Reservation
                </button>
            </div>
        </div>
    `).join('');
    
    // Reinitialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function loadBorrowingHistory() {
    // Mock history data
    const history = [
        {
            id: 5,
            title: 'Operating System Concepts',
            author: 'Abraham Silberschatz',
            borrowDate: '2024-11-15',
            returnDate: '2024-12-15',
            status: 'returned',
            fine: 0
        },
        {
            id: 6,
            title: 'Computer Architecture',
            author: 'David Patterson',
            borrowDate: '2024-10-20',
            returnDate: '2024-11-25',
            status: 'returned',
            fine: 25
        }
    ];
    
    renderHistory(history);
}

function renderHistory(history) {
    const container = document.getElementById('history-books');
    if (!container) return;
    
    container.innerHTML = `
        <div class="history-table">
            <table>
                <thead>
                    <tr>
                        <th>Book</th>
                        <th>Borrow Date</th>
                        <th>Return Date</th>
                        <th>Status</th>
                        <th>Fine</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(record => `
                        <tr>
                            <td>
                                <div class="book-info">
                                    <strong>${record.title}</strong><br>
                                    <small>by ${record.author}</small>
                                </div>
                            </td>
                            <td>${formatDate(record.borrowDate)}</td>
                            <td>${formatDate(record.returnDate)}</td>
                            <td><span class="status-badge ${record.status}">${record.status}</span></td>
                            <td>${record.fine > 0 ? `৳${record.fine}` : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Book action functions
function renewBook(bookId) {
    currentRenewalBookId = bookId;
    
    // Calculate new due date (14 days from current due date)
    const currentDue = new Date();
    currentDue.setDate(currentDue.getDate() + 14);
    const newDue = new Date(currentDue);
    newDue.setDate(newDue.getDate() + 14);
    
    document.getElementById('current-due-date').textContent = formatDate(currentDue);
    document.getElementById('new-due-date').textContent = formatDate(newDue);
    document.getElementById('renewal-fee').textContent = '৳5';
    
    document.getElementById('renewal-modal').style.display = 'block';
}

function confirmRenewal() {
    console.log('Renewing book:', currentRenewalBookId);
    alert('Book renewed successfully! New due date has been set.');
    closeRenewalModal();
    loadBorrowedBooks(); // Refresh the list
}

function closeRenewalModal() {
    document.getElementById('renewal-modal').style.display = 'none';
    currentRenewalBookId = null;
}

function renewAllEligible() {
    if (confirm('Renew all eligible books? This will incur a renewal fee of ৳5 per book.')) {
        alert('All eligible books have been renewed successfully!');
        loadBorrowedBooks();
    }
}

function payFine(bookId) {
    alert('Redirecting to fine payment page...');
    window.location.href = 'fines.html';
}

function returnBook(bookId) {
    if (confirm('Are you sure you want to return this book? Please ensure you have the physical book with you.')) {
        alert('Book return initiated. Please visit the library to complete the return process.');
        loadBorrowedBooks();
    }
}

function confirmPickup(reservationId) {
    if (confirm('Confirm that you have picked up this book from the library?')) {
        alert('Book pickup confirmed! The book has been added to your borrowed books.');
        loadReservations();
        loadBorrowedBooks();
    }
}

function cancelReservation(reservationId) {
    if (confirm('Are you sure you want to cancel this reservation?')) {
        alert('Reservation cancelled successfully.');
        loadReservations();
    }
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Modal event listeners
window.addEventListener('click', function(e) {
    const renewalModal = document.getElementById('renewal-modal');
    if (e.target === renewalModal) {
        closeRenewalModal();
    }
});