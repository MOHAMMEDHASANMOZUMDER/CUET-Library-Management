// My Books JavaScript

// Comprehensive dummy data for development and testing
const dummyData = {
  borrowedBooks: [
    {
      id: 1,
      book: {
        id: 101,
        title: "Introduction to Computer Science",
        author: "Dr. Sarah Johnson",
        isbn: "978-0134444321",
        department: "Computer Science",
        availableCopies: 3
      },
      borrowDate: "2025-09-01",
      dueDate: "2025-09-22", // Due tomorrow (close to current date)
      status: "ACTIVE",
      renewalCount: 1,
      maxRenewals: 3,
      totalFine: 0
    },
    {
      id: 2,
      book: {
        id: 102,
        title: "Advanced Data Structures",
        author: "Prof. Michael Chen",
        isbn: "978-0321573513",
        department: "Computer Science",
        availableCopies: 2
      },
      borrowDate: "2025-08-15",
      dueDate: "2025-09-15", // Overdue
      status: "OVERDUE",
      renewalCount: 2,
      maxRenewals: 3,
      totalFine: 25.50
    },
    {
      id: 3,
      book: {
        id: 103,
        title: "Database Management Systems",
        author: "Dr. Emily Rodriguez",
        isbn: "978-0133970777",
        department: "Computer Science",
        availableCopies: 5
      },
      borrowDate: "2025-09-10",
      dueDate: "2025-10-10", // Future due date
      status: "ACTIVE",
      renewalCount: 0,
      maxRenewals: 3,
      totalFine: 0
    }
  ],
  
  reservations: [
    {
      id: 201,
      book: {
        id: 201,
        title: "Machine Learning Fundamentals",
        author: "Dr. James Wilson",
        isbn: "978-0262035613",
        department: "Computer Science",
        availableCopies: 0
      },
      requestDate: "2025-09-18",
      status: "PENDING",
      priority: 3,
      estimatedAvailability: "2025-09-25"
    },
    {
      id: 202,
      book: {
        id: 202,
        title: "Software Engineering Principles",
        author: "Prof. Lisa Thompson",
        isbn: "978-0134052502",
        department: "Software Engineering",
        availableCopies: 0
      },
      requestDate: "2025-09-16",
      approvedDate: "2025-09-19",
      expiryDate: "2025-09-26",
      status: "APPROVED",
      priority: 1
    },
    {
      id: 203,
      book: {
        id: 203,
        title: "Network Security",
        author: "Dr. Robert Kim",
        isbn: "978-0134444444",
        department: "Cybersecurity",
        availableCopies: 0
      },
      requestDate: "2025-09-10",
      rejectionDate: "2025-09-15",
      status: "REJECTED",
      rejectionReason: "Book reserved for graduate students only",
      priority: 2
    }
  ],
  
  borrowHistory: [
    {
      id: 301,
      book: {
        id: 301,
        title: "Python Programming",
        author: "Dr. Amanda Lee",
        isbn: "978-0134692532",
        department: "Computer Science",
        availableCopies: 4
      },
      borrowDate: "2025-08-01",
      dueDate: "2025-08-31",
      returnDate: "2025-08-30",
      status: "RETURNED",
      renewalCount: 1,
      totalFine: 0
    },
    {
      id: 302,
      book: {
        id: 302,
        title: "Web Development Basics",
        author: "Prof. David Miller",
        isbn: "978-0321967978",
        department: "Computer Science",
        availableCopies: 3
      },
      borrowDate: "2025-07-15",
      dueDate: "2025-08-15",
      returnDate: "2025-08-20",
      status: "RETURNED",
      renewalCount: 0,
      totalFine: 15.00
    },
    {
      id: 303,
      book: {
        id: 303,
        title: "Operating Systems Concepts",
        author: "Dr. Karen Brown",
        isbn: "978-1118063333",
        department: "Computer Science",
        availableCopies: 2
      },
      borrowDate: "2025-06-01",
      dueDate: "2025-07-01",
      returnDate: "2025-07-10",
      status: "RETURNED",
      renewalCount: 2,
      totalFine: 30.00
    },
    {
      id: 304,
      book: {
        id: 304,
        title: "Linear Algebra",
        author: "Prof. Mathematics Dept",
        isbn: "978-0134689517",
        department: "Mathematics",
        availableCopies: 6
      },
      borrowDate: "2025-05-15",
      dueDate: "2025-06-15",
      returnDate: null,
      status: "LOST",
      renewalCount: 1,
      totalFine: 500.00
    }
  ]
};

// Global variables to store real API data
let realBorrowedBooks = [];
let realReservations = [];
let realBorrowHistory = [];

// Debug helper function
function debugLog(message, data = null) {
  console.log(`[My Books Debug] ${message}`, data || '');
  
  // Also show in page if debug panel exists
  const debugInfo = document.getElementById('debug-info');
  if (debugInfo) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<span style="color: #6b7280;">[${timestamp}]</span> ${message}`;
    if (data) {
      logEntry.innerHTML += `: <span style="color: #059669;">${JSON.stringify(data)}</span>`;
    }
    debugInfo.appendChild(logEntry);
    debugInfo.scrollTop = debugInfo.scrollHeight;
  }
}

// Toggle debug panel
function toggleDebug() {
  const panel = document.getElementById('debug-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
}

// Utility function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Show debug panel initially
document.addEventListener('DOMContentLoaded', function() {
  // Add debug panel to page
  const pageContainer = document.querySelector('.page-container');
  if (pageContainer) {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = 'background: #f0f9ff; border: 1px solid #0284c7; border-radius: 8px; padding: 16px; margin-bottom: 20px; display: block;';
    debugPanel.innerHTML = `
      <h4 style="margin: 0 0 12px 0; color: #0c4a6e;">My Books Debug Information</h4>
      <div id="debug-info" style="font-family: monospace; font-size: 12px; color: #374151; max-height: 200px; overflow-y: auto; background: white; padding: 8px; border-radius: 4px;">
        <div>Debug panel initialized...</div>
      </div>
      <button onclick="toggleDebug()" style="margin-top: 8px; padding: 4px 8px; background: #0284c7; color: white; border: none; border-radius: 4px; font-size: 12px;">Hide Debug</button>
      <button onclick="document.getElementById('debug-info').innerHTML='<div>Debug cleared...</div>'" style="margin-top: 8px; margin-left: 8px; padding: 4px 8px; background: #dc2626; color: white; border: none; border-radius: 4px; font-size: 12px;">Clear</button>
    `;
    
    // Insert debug panel after page header but before stats
    const pageHeader = pageContainer.querySelector('.page-header');
    if (pageHeader && pageHeader.nextElementSibling) {
      pageContainer.insertBefore(debugPanel, pageHeader.nextElementSibling);
    } else {
      pageContainer.insertBefore(debugPanel, pageContainer.firstChild);
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const userType = localStorage.getItem("userType");
  const token = localStorage.getItem("token");
  
  debugLog('Page loading started');
  debugLog('User type', userType);
  debugLog('Token exists', !!token);
  
  if (!userType || !token) {
    debugLog('No authentication, redirecting to login');
    window.location.href = "login.html";
    return;
  }

  debugLog('Authentication OK, initializing...');

  initializeTabs();
  loadMyBooks();
  loadUserProfile(); // Load user profile for header
  
  // Load all data automatically like admin page
  loadReservations();
  
  debugLog('All initialization functions called');
});

function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      this.classList.add("active");
      document.getElementById(targetTab + "-tab").classList.add("active");

      switch (targetTab) {
        case "borrowed":
          loadBorrowedBooks();
          break;
        case "reservations":
          loadReservations();
          break;
      }
    });
  });
}

function loadMyBooks() {
  loadBorrowedBooks();
}

async function loadBorrowedBooks() {
  try {
    debugLog('Loading borrowed books...');
    const headers = getAuthHeaders();
    const resp = await fetch('/api/borrow/my-active-borrows', { headers });
    
    debugLog('Borrowed books API response status', resp.status);
    
    let borrowedBooks = [];
    if (resp.ok) {
      const records = await resp.json();
      debugLog('Received borrowed books from API', records);
      
      if (records && records.length > 0) {
        borrowedBooks = records.map(r => ({
          id: r.id,
          book: r.book,
          borrowDate: r.borrowDate,
          dueDate: r.dueDate,
          status: r.status || 'ACTIVE',
          renewalCount: r.renewalCount || 0,
          maxRenewals: r.maxRenewals || 3,
          totalFine: r.totalFine || 0
        }));
        debugLog('Processed borrowed books count', borrowedBooks.length);
      } else {
        debugLog('No borrowed books from API - showing empty state');
        borrowedBooks = [];
      }
    } else {
      const errorText = await resp.text();
      debugLog('API failed', `Status: ${resp.status}, Error: ${errorText}`);
      borrowedBooks = [];
    }

    debugLog('Rendering borrowed books', borrowedBooks.length);
    realBorrowedBooks = borrowedBooks; // Store in global variable
    renderBorrowedBooks(borrowedBooks);
    updateSummaryCounts(); // Update counts after loading data
    debugLog('Borrowed books loading completed');
  } catch (e) {
    debugLog('Error loading borrowed books', e.message);
    // Show empty state on error
    realBorrowedBooks = [];
    renderBorrowedBooks([]);
    updateSummaryCounts();
  }
}

function renderBorrowedBooks(books) {
  const container = document.getElementById("borrowed-books");
  if (!container) return;

  // Debug: Log the first book to see its structure
  if (books && books.length > 0) {
    console.log('First borrowed book object structure:', JSON.stringify(books[0], null, 2));
  }

  if (!books || books.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="book-open" style="width: 48px; height: 48px; color: #6b7280;"></i>
        <h3>No Borrowed Books</h3>
        <p>You haven't borrowed any books yet.</p>
        <a href="books.html" class="btn btn-primary">Browse Books</a>
      </div>
    `;
    return;
  }

  container.innerHTML = books
    .map((record) => {
      const isOverdue = record.status === 'OVERDUE' || (record.status === 'ACTIVE' && new Date(record.dueDate) < new Date());
      const isDueSoon = !isOverdue && record.status === 'ACTIVE' && new Date(record.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const statusClass = isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : 'normal';
      const canRenew = record.status === 'ACTIVE' && record.renewalCount < record.maxRenewals && !isOverdue;
      const daysOverdue = isOverdue ? Math.floor((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24)) : 0;

      // Try multiple paths to get book info
      const bookTitle = record.book?.title || record.bookTitle || record.title || 'Book Title Not Available';
      const bookAuthor = record.book?.author || record.bookAuthor || record.author || 'Author Not Available';
      const bookISBN = record.book?.isbn || record.isbn || 'N/A';
      const bookDept = record.book?.department || record.department || 'General';

      return `
        <div class="borrowed-book-item ${statusClass}">
          <div class="book-image">
            <div style="width: 80px; height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; text-align: center; padding: 8px;">
              📖<br>Book
            </div>
          </div>
          <div class="book-details">
            <h3 class="book-title">${bookTitle}</h3>
            <p class="book-author">by ${bookAuthor}</p>
            <p class="book-isbn">ISBN: ${bookISBN}</p>
            <p class="book-department">Department: ${bookDept}</p>
            <div class="book-dates">
              <div class="date-info">
                <span class="label">Borrowed:</span>
                <span class="date">${formatDate(record.borrowDate)}</span>
              </div>
              <div class="date-info ${statusClass}">
                <span class="label">Due:</span>
                <span class="date">${formatDate(record.dueDate)}</span>
                ${isOverdue ? `<span class="overdue-badge" style="color: #ef4444; font-size: 12px; font-weight: bold;">(${daysOverdue} days overdue)</span>` : ''}
                ${isDueSoon ? '<span class="due-soon-badge" style="color: #f59e0b; font-size: 12px; font-weight: bold;">(Due soon)</span>' : ''}
              </div>
              <div class="renewal-info">
                <span class="label">Renewals:</span>
                <span class="renewals">${record.renewalCount}/${record.maxRenewals}</span>
              </div>
              ${record.totalFine > 0 ? `
                <div class="fine-info" style="color: #ef4444;">
                  <span class="label">Fine:</span>
                  <span class="fine">৳${record.totalFine.toFixed(2)}</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="book-actions">
            <button class="btn btn-outline" onclick="openBookDetailsModal(${record.book?.id})" style="margin-bottom: 8px;">
              <i data-lucide="info"></i>
              View Details
            </button>
            <button class="btn btn-outline" onclick="returnBook(${record.id})">
              <i data-lucide="arrow-left"></i>
              Return Book
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  if (window.lucide) {
    lucide.createIcons();
  }
}

async function loadReservations() {
    try {
    console.log('Loading reservations...');
    const headers = getAuthHeaders();
    if (!headers || Object.keys(headers).length === 0) {
      console.warn('No auth token found for reservations, using empty state');
      realReservations = [];
      const container = document.getElementById("reserved-books");
      if (container) {
        container.innerHTML = '<div class="empty-state"><h3>Please Login</h3><p>You need to be logged in to view reservations.</p></div>';
      }
      return;
    }

    const resp = await fetch('/api/prebooks/user', { headers });
    
    console.log('Reservations API response status:', resp.status);
    
    let reservations = [];
    if (resp.ok) {
      reservations = await resp.json();
      console.log('Received reservations from API:', reservations);
      
      if (!reservations || reservations.length === 0) {
        console.log('No reservations from API - showing empty state');
        reservations = [];
      }
    } else {
      const errorText = await resp.text();
      console.error('Reservations API failed:', resp.status, errorText);
      console.log('Using empty state');
      reservations = [];
    }

    realReservations = reservations; // Store in global variable

    const container = document.getElementById("reserved-books");
    if (!container) {
      console.warn('Reserved books container not found');
      return;
    }

    if (!reservations || reservations.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>No Reservations</h3><p>You haven\'t made any book reservations yet.</p></div>';
      return;
    }

    // Debug: Log the first reservation to see its structure
    if (reservations.length > 0) {
      console.log('First reservation object structure:', JSON.stringify(reservations[0], null, 2));
    }

    let html = '';
    reservations.forEach(pb => {
      const statusBg = pb.status === 'PENDING' ? '#f59e0b' : pb.status === 'APPROVED' ? '#10b981' : '#ef4444';
      
      // Try multiple paths to get book info
      const bookTitle = pb.book?.title || pb.bookTitle || pb.title || 'Book Title Not Available';
      const bookAuthor = pb.book?.author || pb.bookAuthor || pb.author || 'Author Not Available';
      
      html += '<div class="reserved-book-item">';
      html += '<div class="book-details">';
      html += '<h3>' + bookTitle + '</h3>';
      html += '<p>by ' + bookAuthor + '</p>';
      html += '<p>Status: <span style="background: ' + statusBg + '; color: white; padding: 2px 8px; border-radius: 4px;">' + pb.status + '</span></p>';
      
      // Show ISBN if available for debugging
      if (pb.isbn || pb.book?.isbn) {
        html += '<p style="font-size: 12px; color: #6b7280;">ISBN: ' + (pb.isbn || pb.book?.isbn) + '</p>';
      }
      
      html += '</div></div>';
    });

    container.innerHTML = html;
    console.log('Reservations rendered successfully');
    updateSummaryCounts();
  } catch (e) {
    console.error('Error loading reservations:', e);
    realReservations = []; // Store empty array in global variable
    const container = document.getElementById("reserved-books");
    if (container) {
      container.innerHTML = '<div class="error-state"><h3>Error</h3><p>Could not load reservations</p></div>';
    }
    updateSummaryCounts();
  }
}

// Load real fine data from the API
async function loadUserFines() {
  try {
    debugLog('Loading user fines...');
    const token = localStorage.getItem('token');
    if (!token) {
      debugLog('No authentication token found');
      return [];
    }

    const response = await fetch('/api/fines/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const fines = await response.json();
    debugLog('Loaded user fines:', fines);
    return fines || [];

  } catch (error) {
    debugLog('Error loading user fines:', error.message);
    debugLog('Falling back to dummy data');
    return [];
  }
}

function renderHistory(history) {
  const container = document.getElementById("history-books");
  if (!container) return;

  if (!history || history.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No Borrow History</h3><p>You haven\'t borrowed any books yet.</p></div>';
    return;
  }

  // Sort by borrow date (most recent first)
  history.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

  let tableHTML = '<div class="history-table"><table style="width: 100%; border-collapse: collapse;">';
  tableHTML += '<thead><tr style="background-color: #f8f9fa;">';
  tableHTML += '<th style="padding: 12px 15px; border: 1px solid #ddd;">Book</th>';
  tableHTML += '<th style="padding: 12px 15px; border: 1px solid #ddd;">Borrow Date</th>';
  tableHTML += '<th style="padding: 12px 15px; border: 1px solid #ddd;">Return Date</th>';
  tableHTML += '<th style="padding: 12px 15px; border: 1px solid #ddd;">Status</th>';
  tableHTML += '<th style="padding: 12px 15px; border: 1px solid #ddd;">Fine</th>';
  tableHTML += '</tr></thead><tbody>';

  history.forEach(record => {
    const statusBg = getStatusColor(record.status);
    
    tableHTML += '<tr>';
    tableHTML += '<td style="padding: 12px 15px; border: 1px solid #ddd;">';
    tableHTML += '<div style="display: flex; align-items: center;">';
    tableHTML += '<div style="width: 50px; height: 70px; margin-right: 15px; border-radius: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">📖</div>';
    tableHTML += '<div>';
    tableHTML += '<h4 style="margin: 0; font-size: 14px;">' + (record.book?.title || 'Unknown Title') + '</h4>';
    tableHTML += '<p style="margin: 0; font-size: 12px; color: #666;">' + (record.book?.author || 'Unknown Author') + '</p>';
    tableHTML += '</div></div></td>';
    tableHTML += '<td style="padding: 12px 15px; border: 1px solid #ddd;">' + formatDate(record.borrowDate) + '</td>';
    tableHTML += '<td style="padding: 12px 15px; border: 1px solid #ddd;">' + (record.returnDate ? formatDate(record.returnDate) : 'Not returned') + '</td>';
    tableHTML += '<td style="padding: 12px 15px; border: 1px solid #ddd;"><span style="background: ' + statusBg + '; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">' + record.status + '</span></td>';
    tableHTML += '<td style="padding: 12px 15px; border: 1px solid #ddd;">' + (record.totalFine > 0 ? '৳' + record.totalFine.toFixed(2) : 'No fine') + '</td>';
    tableHTML += '</tr>';
  });

  tableHTML += '</tbody></table></div>';
  container.innerHTML = tableHTML;

  if (window.lucide) lucide.createIcons();
}

async function returnBook(borrowRecordId) {
    if (!confirm('Are you sure you want to return this book?')) return;
    try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please log in to return books.', 'warning');
      return;
    }
        
        const resp = await fetch(`/api/borrow/return/${borrowRecordId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Failed to return book');
        showNotification('Book returned successfully!', 'success');
        loadBorrowedBooks();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to return book', 'error');
    }
}

async function cancelReservation(prebookId) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please log in to cancel reservations.', 'warning');
      return;
    }

    const resp = await fetch(`/api/prebooks/${prebookId}/cancel`, {
      method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Failed to cancel reservation');
        showNotification('Reservation cancelled successfully!', 'success');
        loadReservations();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to cancel reservation', 'error');
    }
}

async function borrowFromReservation(prebookId) {
    try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please log in to borrow books.', 'warning');
      return;
    }
        
        // First get the prebook details
        const prebookResp = await fetch(`/api/prebooks/${prebookId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!prebookResp.ok) throw new Error('Failed to get reservation details');
        const prebook = await prebookResp.json();
        
        // Borrow the book
        const borrowResp = await fetch(`/api/borrow/book/${prebook.book.isbn}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!borrowResp.ok) throw new Error('Failed to borrow book');
        
        showNotification('Book borrowed successfully!', 'success');
        loadReservations();
        loadBorrowedBooks();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to borrow book', 'error');
    }
}

// Utility function for notifications
function showNotification(message, type = 'info') {
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

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Make functions globally available
window.returnBook = returnBook;
window.cancelReservation = cancelReservation;
window.borrowFromReservation = borrowFromReservation;

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

window.addEventListener("click", function (e) {
  const renewalModal = document.getElementById("renewal-modal");
  if (e.target === renewalModal) {
    document.getElementById("renewal-modal").style.display = "none";
    currentRenewalBookId = null;
  }
});

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "styles/main.css";
document.head.appendChild(link);

async function cancelReservation(prebookId) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please log in to cancel reservations.', 'warning');
      return;
    }

    const resp = await fetch(`/api/prebooks/${prebookId}/cancel`, {
      method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Failed to cancel reservation');
        showNotification('Reservation cancelled successfully!', 'success');
        loadReservations();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to cancel reservation', 'error');
    }
}

async function borrowFromReservation(prebookId) {
    try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please log in to borrow books.', 'warning');
      return;
    }
        
        // First get the prebook details
        const prebookResp = await fetch(`/api/prebooks/${prebookId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!prebookResp.ok) throw new Error('Failed to get reservation details');
        const prebook = await prebookResp.json();
        
        // Borrow the book
        const borrowResp = await fetch(`/api/borrow/book/${prebook.book.isbn}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!borrowResp.ok) throw new Error('Failed to borrow book');
        
        showNotification('Book borrowed successfully!', 'success');
        loadReservations();
        loadBorrowedBooks();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to borrow book', 'error');
    }
}

// Utility function for notifications
function showNotification(message, type = 'info') {
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

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Real-time counting system
async function updateSummaryCounts() {
  // Get current data (use dummy data if API data not available)
  const borrowedBooks = getCurrentBorrowedBooks();
  const reservations = getCurrentReservations();
  const allBorrowHistory = getCurrentBorrowHistory();
  
  // Calculate counts
  const borrowedCount = borrowedBooks.length;
  const dueSoonCount = borrowedBooks.filter(book => isDueSoon(book)).length;
  const reservationsCount = reservations.filter(r => r.status === 'PENDING' || r.status === 'APPROVED').length;
  
  // Load real fine data from API instead of using dummy data
  let totalFine = 0;
  try {
    const userFines = await loadUserFines();
    // Only count unpaid fines towards the total outstanding amount
    totalFine = userFines
      .filter(fine => !fine.payment) // Only unpaid fines
      .reduce((sum, fine) => sum + (fine.amount || 0), 0);
    debugLog('Real total outstanding fine calculated:', totalFine);
  } catch (error) {
    debugLog('Failed to load real fines, calculating from dummy data:', error.message);
    totalFine = borrowedBooks.reduce((sum, book) => sum + (book.totalFine || 0), 0) + 
               allBorrowHistory.reduce((sum, record) => sum + (record.totalFine || 0), 0);
  }
  
  // Update DOM elements
  updateCountElement('borrowed-count', borrowedCount);
  updateCountElement('due-soon-count', dueSoonCount);
  updateCountElement('reservations-count', reservationsCount);
  updateCountElement('total-fine', `৳${totalFine.toFixed(2)}`);
}

function getCurrentBorrowedBooks() {
  // Return real API data instead of dummy data
  return realBorrowedBooks.filter(book => book.status === 'ACTIVE' || book.status === 'OVERDUE');
}

function getCurrentReservations() {
  // Return real API data instead of dummy data
  return realReservations;
}

function getCurrentBorrowHistory() {
  // Return real API data instead of dummy data
  return realBorrowHistory;
}

function isDueSoon(book) {
  if (!book.dueDate || book.status !== 'ACTIVE') return false;
  const dueDate = new Date(book.dueDate);
  const today = new Date();
  const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
  return dueDate <= threeDaysFromNow && dueDate >= today;
}

function updateCountElement(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
    // Add a subtle animation to show the update
    element.style.transform = 'scale(1.1)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 200);
  }
}

// Utility functions for enhanced UI
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid Date';
  }
}

function calculateDaysOverdue(dueDate) {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  if (today <= due) return 0;
  return Math.floor((today - due) / (1000 * 60 * 60 * 24));
}

function getStatusColor(status) {
  const colors = {
    'ACTIVE': '#3b82f6',
    'OVERDUE': '#ef4444',
    'RETURNED': '#10b981',
    'LOST': '#991b1b',
    'DAMAGED': '#f59e0b',
    'PENDING': '#f59e0b',
    'APPROVED': '#10b981',
    'REJECTED': '#ef4444',
    'EXPIRED': '#6b7280'
  };
  return colors[status] || '#6b7280';
}

// Enhanced notification function
function showNotification(message, type = 'info') {
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
        transition: all 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : ''}
        ${type === 'error' ? 'background: #ef4444;' : ''}
        ${type === 'warning' ? 'background: #f59e0b;' : ''}
        ${type === 'info' ? 'background: #3b82f6;' : ''}
    `;

    document.body.appendChild(notification);

    // Add entrance animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize counts on page load
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other initialization to complete
    setTimeout(updateSummaryCounts, 500);
    
    // Update counts every 30 seconds for real-time feel
    setInterval(updateSummaryCounts, 30000);
});

// Make functions globally available
window.cancelReservation = cancelReservation;
window.borrowFromReservation = borrowFromReservation;
window.updateSummaryCounts = updateSummaryCounts;

// Notes Modal Functions
let currentNotesBookId = null;
let currentNotesData = [];

function openNotesModal(bookId, bookTitle) {
    currentNotesBookId = bookId;
    document.getElementById('modal-book-title').textContent = bookTitle;
    
    // Get notes for this book from dummy data
    currentNotesData = dummyData.notes.filter(note => note.bookId === bookId);
    renderNotes();
    
    document.getElementById('notes-modal').style.display = 'flex';
}

function closeNotesModal() {
    document.getElementById('notes-modal').style.display = 'none';
    currentNotesBookId = null;
    currentNotesData = [];
}

function renderNotes() {
    const notesList = document.getElementById('notes-list');
    const filter = document.getElementById('notes-filter').value;
    
    let filteredNotes = currentNotesData;
    if (filter !== 'all') {
        filteredNotes = currentNotesData.filter(note => note.category === filter);
    }
    
    if (filteredNotes.length === 0) {
        notesList.innerHTML = '<div class="empty-state"><p>No notes found for this filter.</p></div>';
        return;
    }
    
    let html = '';
    filteredNotes.forEach(note => {
        const date = new Date(note.createdDate).toLocaleDateString();
        const categoryColor = note.category === 'quotes' ? '#f59e0b' : note.category === 'summary' ? '#10b981' : '#6b7280';
        
        html += '<div class="note-card">';
        html += '<div class="note-header">';
        html += '<span class="note-category" style="background: ' + categoryColor + '; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">' + note.category + '</span>';
        html += '<span class="note-date">' + date + '</span>';
        html += '</div>';
        html += '<div class="note-content">' + note.content + '</div>';
        html += '<div class="note-actions">';
        html += '<button class="btn-small btn-outline" onclick="editNote(' + note.id + ')">Edit</button>';
        html += '<button class="btn-small btn-danger" onclick="deleteNote(' + note.id + ')">Delete</button>';
        html += '</div>';
        html += '</div>';
    });
    
    notesList.innerHTML = html;
}

function filterNotes() {
    renderNotes();
}

function addNote() {
    const content = document.getElementById('new-note-content').value.trim();
    const category = document.getElementById('note-category').value;
    
    if (!content) {
        showNotification('Please enter note content', 'error');
        return;
    }
    
    const newNote = {
        id: Date.now(),
        userId: 1, // Current user
        bookId: currentNotesBookId,
        content: content,
        category: category,
        createdDate: new Date().toISOString()
    };
    
    // Add to dummy data (in real app, this would be an API call)
    dummyData.notes.push(newNote);
    currentNotesData = dummyData.notes.filter(note => note.bookId === currentNotesBookId);
    
    // Clear the form
    document.getElementById('new-note-content').value = '';
    document.getElementById('note-category').selectedIndex = 0;
    
    renderNotes();
    showNotification('Note added successfully', 'success');
}

function editNote(noteId) {
    const note = currentNotesData.find(n => n.id === noteId);
    if (!note) return;
    
    const newContent = prompt('Edit note:', note.content);
    if (newContent && newContent.trim()) {
        note.content = newContent.trim();
        renderNotes();
        showNotification('Note updated successfully', 'success');
    }
}

function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        const index = dummyData.notes.findIndex(n => n.id === noteId);
        if (index > -1) {
            dummyData.notes.splice(index, 1);
            currentNotesData = dummyData.notes.filter(note => note.bookId === currentNotesBookId);
            renderNotes();
            showNotification('Note deleted successfully', 'success');
        }
    }
}

// Book Details Modal Functions
function openBookDetailsModal(bookId) {
    const book = findBookById(bookId);
    if (!book) return;
    
    const content = document.getElementById('book-details-content');
    content.innerHTML = `
        <div class="book-detail-card">
            <div class="book-cover">
                <i data-lucide="book-open" size="48"></i>
            </div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>ISBN:</strong> ${book.isbn}</p>
                <p><strong>Department:</strong> ${book.department}</p>
                <p><strong>Available Copies:</strong> ${book.availableCopies}</p>
                <p><strong>Publication Year:</strong> ${book.publicationYear || 'N/A'}</p>
                <p><strong>Category:</strong> ${book.category || 'General'}</p>
                <div class="book-description">
                    <strong>Description:</strong>
                    <p>${book.description || 'No description available.'}</p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('book-details-modal').style.display = 'flex';
    
    // Re-create icons
    setTimeout(() => lucide.createIcons(), 100);
}

function closeBookDetailsModal() {
    document.getElementById('book-details-modal').style.display = 'none';
}

function findBookById(bookId) {
    // Search in all book collections
    for (let borrow of dummyData.borrowedBooks) {
        if (borrow.book.id === bookId) return borrow.book;
    }
    for (let reservation of dummyData.reservations) {
        if (reservation.book.id === bookId) return reservation.book;
    }
    for (let history of dummyData.borrowHistory) {
        if (history.book.id === bookId) return history.book;
    }
    return null;
}

// User Profile Functions
async function loadUserProfile() {
    try {
    const token = localStorage.getItem('token');

    let user = {
      name: 'Guest User',
      email: 'guest@library.local',
      department: 'N/A'
    };

    if (token) {
      const resp = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (resp.ok) {
        user = await resp.json();
      } else {
        console.log('Failed to load profile from API');
      }
    }
        
        // Update header user info - User entity has 'name' field, not firstName/lastName
        const displayName = user.name || 'User';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || displayName;
        
        // Only update elements if they exist (my-books.html may not have these elements)
        const userNameEl = document.getElementById('userName');
        const userFullNameEl = document.getElementById('userFullName');
        const userEmailEl = document.getElementById('userEmail');
        const userDepartmentEl = document.getElementById('userDepartment');
        
        if (userNameEl) userNameEl.textContent = firstName;
        if (userFullNameEl) userFullNameEl.textContent = displayName;
        if (userEmailEl) userEmailEl.textContent = user.email || 'N/A';
        if (userDepartmentEl) userDepartmentEl.textContent = user.department || 'N/A';
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Use fallback data on error
        const user = {
            name: 'Guest User',
            email: 'guest@library.local',
            department: 'N/A'
        };
        const displayName = user.name;
        const firstName = displayName.split(' ')[0];
        
        // Only update elements if they exist
        const userNameEl = document.getElementById('userName');
        const userFullNameEl = document.getElementById('userFullName');
        const userEmailEl = document.getElementById('userEmail');
        const userDepartmentEl = document.getElementById('userDepartment');
        
        if (userNameEl) userNameEl.textContent = firstName;
        if (userFullNameEl) userFullNameEl.textContent = displayName;
        if (userEmailEl) userEmailEl.textContent = user.email;
        if (userDepartmentEl) userDepartmentEl.textContent = user.department;
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// Close user menu when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && dropdown && !userMenu.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Make new functions globally available
window.openNotesModal = openNotesModal;
window.closeNotesModal = closeNotesModal;
window.filterNotes = filterNotes;
window.addNote = addNote;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.openBookDetailsModal = openBookDetailsModal;
window.closeBookDetailsModal = closeBookDetailsModal;
window.toggleUserMenu = toggleUserMenu;
window.logout = logout;

// Notification System Functions
let notificationCount = 0;
let unreadNotifications = [];

function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    const isVisible = panel.style.display !== 'none';
    
    if (isVisible) {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        loadNotifications();
    }
}

function markAllAsRead() {
    unreadNotifications = [];
    notificationCount = 0;
    updateNotificationBadge();
    renderNotifications();
    
    // Close panel after marking all as read
    document.getElementById('notificationPanel').style.display = 'none';
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (notificationCount > 0) {
        badge.textContent = notificationCount > 99 ? '99+' : notificationCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function loadNotifications() {
    // Clear existing notifications
    unreadNotifications = [];
    
    // Sample notifications for demonstration
    addNotification({
        type: 'info',
        title: 'Welcome!',
        description: 'Welcome to the My Books section. Here you can manage your borrowed books and reservations.',
        time: 'Just now',
        isRead: false
    });
    
    // Check for due books and add notifications
    const dueSoonBooks = [];
    // This would be populated from actual data
    
    if (dueSoonBooks.length > 0) {
        addNotification({
            type: 'warning',
            title: 'Books Due Soon',
            description: `You have ${dueSoonBooks.length} book(s) due within 3 days.`,
            time: '2 hours ago',
            isRead: false
        });
    }
    
    renderNotifications();
}

function addNotification(notification) {
    if (!notification.isRead) {
        unreadNotifications.push(notification);
        notificationCount++;
    }
    updateNotificationBadge();
}

function renderNotifications() {
    const container = document.getElementById('notificationList');
    
    if (unreadNotifications.length === 0) {
        container.innerHTML = `
            <div class="empty-notifications">
                <i data-lucide="bell"></i>
                <p>No new notifications</p>
            </div>
        `;
    } else {
        container.innerHTML = unreadNotifications.map(notification => `
            <div class="notification-item ${!notification.isRead ? 'unread' : ''}">
                <div class="notification-content">
                    <div class="notification-icon ${notification.type}">
                        <i data-lucide="${getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-text">
                        <p class="notification-title">${notification.title}</p>
                        <p class="notification-description">${notification.description}</p>
                        <span class="notification-time">${notification.time}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'warning': return 'alert-triangle';
        case 'danger': return 'x-circle';
        case 'info': 
        default: return 'info';
    }
}

// Initialize notifications when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadNotifications();
});

// Close notification panel when clicking outside
document.addEventListener('click', function(event) {
    const panel = document.getElementById('notificationPanel');
    const btn = document.getElementById('notificationBtn');
    
    if (panel && btn && !panel.contains(event.target) && !btn.contains(event.target)) {
        panel.style.display = 'none';
    }
});

// Make notification functions globally available
window.toggleNotificationPanel = toggleNotificationPanel;
window.markAllAsRead = markAllAsRead;
window.loadNotifications = loadNotifications;
