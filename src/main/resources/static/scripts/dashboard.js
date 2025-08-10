// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first - redirect if not logged in
    const userType = localStorage.getItem('userType');
    if (!userType) {
        window.location.href = 'login.html';
        return;
    }

    // Update welcome message with user data
    updateWelcomeMessage();
    
    // Load dashboard data
    loadDashboardStats();
    loadRecentActivity();
    loadDueDates();
});

function updateWelcomeMessage() {
    const user = getCurrentUser();
    const welcomeTitle = document.querySelector('.welcome-title');
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    
    if (welcomeTitle && user.name) {
        welcomeTitle.textContent = `Welcome back, ${user.name}!`;
    }
    
    if (welcomeSubtitle && user.id) {
        welcomeSubtitle.textContent = `Student ID: ${user.id} | Department: Computer Science & Engineering`;
    }
}

function loadDashboardStats() {
    // Mock data - replace with actual API calls
    const stats = {
        booksAllocated: 3,
        dueSoon: 2,
        outstandingFines: 50,
        overdueBooks: 1,
        notesUploaded: 12,
        notesThisWeek: 2,
        prebookings: 1,
        readyForPickup: 1
    };
    
    // Update stat cards
    updateStatCard('books-borrowed', stats.booksAllocated, `${stats.dueSoon} due soon`);
    updateStatCard('outstanding-fines', `৳${stats.outstandingFines}`, `${stats.overdueBooks} overdue book`);
    updateStatCard('notes-uploaded', stats.notesUploaded, `+${stats.notesThisWeek} this week`);
    updateStatCard('prebookings', stats.prebookings, 'Ready for pickup');
}

function updateStatCard(cardId, number, description) {
    const statNumber = document.querySelector(`[data-stat="${cardId}"] .stat-number`);
    const statDescription = document.querySelector(`[data-stat="${cardId}"] .stat-description`);
    
    if (statNumber) statNumber.textContent = number;
    if (statDescription) statDescription.textContent = description;
}

function loadRecentActivity() {
    // Mock recent activities - replace with actual API call
    const activities = [
        {
            icon: 'book-open',
            text: 'Borrowed "Database Management Systems"',
            time: '2 hours ago'
        },
        {
            icon: 'file-text',
            text: 'Uploaded "OOP Concepts Notes"',
            time: '1 day ago'
        },
        {
            icon: 'credit-card',
            text: 'Paid fine of ৳25',
            time: '3 days ago'
        }
    ];
    
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i data-lucide="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
        
        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

function loadDueDates() {
    // Mock due dates - replace with actual API call
    const dueDates = [
        {
            title: 'Data Structures and Algorithms',
            author: 'by Robert Sedgewick',
            dueDate: 'Tomorrow',
            status: 'urgent'
        },
        {
            title: 'Computer Networks',
            author: 'by Andrew S. Tanenbaum',
            dueDate: 'Jan 18',
            status: 'warning'
        },
        {
            title: 'Software Engineering',
            author: 'by Ian Sommerville',
            dueDate: 'Jan 25',
            status: 'normal'
        }
    ];
    
    const dueList = document.querySelector('.due-list');
    if (dueList) {
        dueList.innerHTML = dueDates.map(book => `
            <div class="due-item ${book.status}">
                <div class="due-book">
                    <h4>${book.title}</h4>
                    <p>${book.author}</p>
                </div>
                <div class="due-date">
                    <span class="due-label">Due</span>
                    <span class="due-time">${book.dueDate}</span>
                </div>
            </div>
        `).join('');
    }
}

// Navigation functions
function navigateToBooks() {
    window.location.href = 'books.html';
}

function navigateToMyBooks() {
    window.location.href = 'my-books.html';
}

function navigateToFines() {
    window.location.href = 'fines.html';
}

function navigateToNotes() {
    window.location.href = 'notes.html';
}