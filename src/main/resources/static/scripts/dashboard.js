// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', async function() {
  // Require authentication
  const userType = localStorage.getItem('userType');
  if (!userType) {
    window.location.href = 'login.html';
    return;
  }

  updateWelcomeMessage();

  await loadDashboardStats();
  await loadRecentActivity();
  await loadDueDates();
  
  // Initialize notification system
  initializeNotificationSystem();
  await loadNotifications();
  
  // Refresh notifications every 5 minutes
  setInterval(loadNotifications, 5 * 60 * 1000);
});

function updateWelcomeMessage() {
  const user = getCurrentUser();
  const welcomeTitle = document.querySelector('.welcome-title');
  const welcomeSubtitle = document.querySelector('.welcome-subtitle');

  if (welcomeTitle && user.name) {
    welcomeTitle.textContent = `Welcome back, ${user.name}!`;
  }

  if (welcomeSubtitle) {
    const studentId = user.studentId || '';
    const dept = user.department || '';
    if (studentId || dept) {
      const left = studentId ? `Student ID: ${studentId}` : '';
      const right = dept ? `Department: ${dept}` : '';
      welcomeSubtitle.textContent = [left, right].filter(Boolean).join(' | ');
    } else if (user.email) {
      welcomeSubtitle.textContent = user.email;
    }
  }
}

// Utility function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function loadDashboardStats() {
  try {
    const token = localStorage.getItem('token');

    // Total and available books
    const headers = getAuthHeaders();
    const [totalResp, availResp] = await Promise.all([
      fetch('/api/books/stats/total', { headers }),
      fetch('/api/books/stats/available', { headers })
    ]);
    if (totalResp.ok) {
      const total = await totalResp.text();
      updateStatCard('books-borrowed', '0', ''); // temp; will be updated by my borrows below
      // We don't show total books in cards, but you could place it elsewhere if needed
    }
    if (availResp.ok) {
      const available = await availResp.text();
      // Not displayed directly; kept for future use
    }

    // My active borrows and due soon
    let myActive = [];
    try {
      const resp = await fetch('/api/borrow/my-active-borrows', { headers });
      if (resp.ok) myActive = await resp.json();
    } catch (e) { console.error('Error fetching my-active-borrows', e); }

    const dueSoon = myActive.filter(r => {
      const due = r && r.dueDate ? new Date(r.dueDate) : null;
      if (!due) return false;
      const now = new Date();
      const diffDays = (due - now) / (1000*60*60*24);
      return diffDays >= 0 && diffDays <= 3;
    }).length;
    updateStatCard('books-borrowed', String(myActive.length || 0), `${dueSoon} due soon`);

    // Outstanding fines - compute unpaid based on status === 'UNPAID'
    let fines = [];
    try {
      const resp = await fetch('/api/fines/user', { headers });
      if (resp.ok) fines = await resp.json();
    } catch (e) { console.error('Error fetching fines', e); }
    const unpaid = (fines || []).filter(f => f.status === 'UNPAID');
    const unpaidTotal = unpaid.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    updateStatCard('outstanding-fines', `৳${unpaidTotal}`, `${unpaid.length} unpaid item${unpaid.length !== 1 ? 's' : ''}`);

    // My notes
    let myNotes = [];
    try {
      const resp = await fetch('/api/notes/user', { headers });
      if (resp.ok) myNotes = await resp.json();
    } catch (e) { console.error('Error fetching notes', e); }
    updateStatCard('notes-uploaded', String((myNotes || []).length), 'My uploads');

    // Prebookings
    let prebooks = [];
    try {
      const resp = await fetch('/api/prebooks/user', { headers });
      if (resp.ok) prebooks = await resp.json();
    } catch (e) { console.error('Error fetching prebooks', e); }
    const approved = (prebooks || []).filter(pb => pb.status === 'APPROVED').length;
    updateStatCard('prebookings', String((prebooks || []).length), `${approved} approved`);
  } catch (e) {
    console.error('Dashboard load error', e);
  }
}

function updateStatCard(cardId, number, description) {
  const statNumber = document.querySelector(`[data-stat="${cardId}"] .stat-number`);
  const statDescription = document.querySelector(`[data-stat="${cardId}"] .stat-description`);

  if (statNumber) statNumber.textContent = number;
  if (statDescription) statDescription.textContent = description || '';
}

async function loadRecentActivity() {
  // For now, derive from borrows as placeholder
  const token = localStorage.getItem('token');
  let recent = [];
  try {
    const resp = await fetch('/api/borrow/my-borrows', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    if (resp.ok) recent = await resp.json();
  } catch {}

  const items = (recent || []).slice(-3).reverse().map(r => ({
    icon: r.returnDate ? 'arrow-left' : 'book-open',
    text: `${r.returnDate ? 'Returned' : 'Borrowed'} "${r.book?.title || 'Book'}"`,
    time: r.borrowDate || ''
  }));

  const activityList = document.querySelector('.activity-list');
  if (activityList) {
    activityList.innerHTML = items.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">
          <i data-lucide="${activity.icon}"></i>
        </div>
        <div class="activity-content">
          <p class="activity-text">${activity.text}</p>
          <span class="activity-time">${activity.time ? new Date(activity.time).toLocaleString() : ''}</span>
        </div>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
  }
}

async function loadDueDates() {
  const token = localStorage.getItem('token');
  let myActive = [];
  try {
    const resp = await fetch('/api/borrow/my-active-borrows', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    if (resp.ok) myActive = await resp.json();
  } catch {}

  const dueList = document.querySelector('.due-list');
  if (!dueList) return;

  if (!myActive || myActive.length === 0) {
    dueList.innerHTML = '';
    return;
  }

  const rows = myActive.map(b => {
    const due = b.dueDate ? new Date(b.dueDate) : null;
    const now = new Date();
    let status = 'normal';
    if (due) {
      const diffDays = (due - now) / (1000*60*60*24);
      if (diffDays < 0) status = 'urgent';
      else if (diffDays <= 3) status = 'warning';
    }
    return {
      title: b.book?.title || 'Book',
      author: b.book?.author ? `by ${b.book.author}` : '',
      dueDate: due ? due.toLocaleDateString() : '',
      status
    };
  });

  dueList.innerHTML = rows.map(book => `
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

// Navigation functions
function navigateToBooks() { window.location.href = 'books.html'; }
function navigateToMyBooks() { window.location.href = 'my-books.html'; }
function navigateToFines() { window.location.href = 'fines.html'; }
function navigateToNotes() { window.location.href = 'notes.html'; }

// Notification System
let notificationPanel = null;
let notificationTimeout = null;

function initializeNotificationSystem() {
  const notificationBtn = document.querySelector('.notification-btn');
  notificationPanel = document.querySelector('.notification-panel');
  
  if (notificationBtn && notificationPanel) {
    notificationBtn.addEventListener('click', toggleNotificationPanel);
    
    // Close panel when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.notification-container')) {
        hideNotificationPanel();
      }
    });
  }
}

function toggleNotificationPanel() {
  if (notificationPanel.style.display === 'block') {
    hideNotificationPanel();
  } else {
    showNotificationPanel();
    loadNotifications();
  }
}

function showNotificationPanel() {
  if (notificationPanel) {
    notificationPanel.style.display = 'block';
    markNotificationsAsRead();
  }
}

function hideNotificationPanel() {
  if (notificationPanel) {
    notificationPanel.style.display = 'none';
  }
}

async function loadNotifications() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Fetch all relevant data
    const [
      notesResponse,
      prebooksResponse,
      borrowsResponse,
      finesResponse
    ] = await Promise.all([
      fetch('/api/notes/user', { headers }),
      fetch('/api/prebooks/user', { headers }),
      fetch('/api/borrow/my-active-borrows', { headers }),
      fetch('/api/fines/user', { headers })
    ]);

    const notifications = [];
    
    // Process notes
    if (notesResponse.ok) {
      const notes = await notesResponse.json();
      notes.forEach(note => {
        if (note.status === 'APPROVED') {
          notifications.push({
            id: `note-${note.id}`,
            type: 'success',
            icon: 'check-circle',
            title: 'Note Approved',
            description: `Your note "${note.title}" has been approved`,
            time: new Date(note.lastModified || note.uploadDate),
            category: 'notes'
          });
        } else if (note.status === 'REJECTED') {
          notifications.push({
            id: `note-${note.id}`,
            type: 'danger',
            icon: 'x-circle',
            title: 'Note Rejected',
            description: `Your note "${note.title}" was rejected`,
            time: new Date(note.lastModified || note.uploadDate),
            category: 'notes'
          });
        }
      });
    }

    // Process prebooks
    if (prebooksResponse.ok) {
      const prebooks = await prebooksResponse.json();
      prebooks.forEach(prebook => {
        if (prebook.status === 'APPROVED') {
          notifications.push({
            id: `prebook-${prebook.id}`,
            type: 'success',
            icon: 'book-check',
            title: 'Pre-book Approved',
            description: `Your pre-booking for "${prebook.book?.title || 'Book'}" has been approved`,
            time: new Date(prebook.requestDate),
            category: 'prebooks'
          });
        } else if (prebook.status === 'REJECTED') {
          notifications.push({
            id: `prebook-${prebook.id}`,
            type: 'danger',
            icon: 'book-x',
            title: 'Pre-book Rejected',
            description: `Your pre-booking for "${prebook.book?.title || 'Book'}" was rejected`,
            time: new Date(prebook.requestDate),
            category: 'prebooks'
          });
        }
      });
    }

    // Process due books
    if (borrowsResponse.ok) {
      const borrows = await borrowsResponse.json();
      const now = new Date();
      
      borrows.forEach(borrow => {
        if (borrow.dueDate) {
          const dueDate = new Date(borrow.dueDate);
          const diffDays = (dueDate - now) / (1000 * 60 * 60 * 24);
          
          if (diffDays < 0) {
            // Overdue
            notifications.push({
              id: `overdue-${borrow.id}`,
              type: 'danger',
              icon: 'clock',
              title: 'Book Overdue',
              description: `"${borrow.book?.title || 'Book'}" was due ${Math.abs(Math.floor(diffDays))} day(s) ago`,
              time: dueDate,
              category: 'overdue'
            });
          } else if (diffDays <= 3) {
            // Due soon
            notifications.push({
              id: `due-${borrow.id}`,
              type: 'warning',
              icon: 'clock',
              title: 'Book Due Soon',
              description: `"${borrow.book?.title || 'Book'}" is due in ${Math.floor(diffDays)} day(s)`,
              time: dueDate,
              category: 'due'
            });
          }
        }
      });
    }

    // Process fines
    if (finesResponse.ok) {
      const fines = await finesResponse.json();
      fines.forEach(fine => {
        if (!fine.payment) {
          notifications.push({
            id: `fine-${fine.id}`,
            type: 'danger',
            icon: 'dollar-sign',
            title: 'Outstanding Fine',
            description: `You have an unpaid fine of ৳${fine.amount} for "${fine.borrow?.book?.title || 'Book'}"`,
            time: new Date(fine.issueDate),
            category: 'fines'
          });
        }
      });
    }

    // Sort notifications by time (newest first)
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    renderNotifications(notifications);
    updateNotificationBadge(notifications.length);

  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

function renderNotifications(notifications) {
  const notificationList = document.querySelector('.notification-list');
  if (!notificationList) return;

  if (notifications.length === 0) {
    notificationList.innerHTML = `
      <div class="empty-notifications">
        <i data-lucide="bell"></i>
        <p>No new notifications</p>
      </div>
    `;
  } else {
    notificationList.innerHTML = notifications.map(notification => `
      <div class="notification-item ${notification.category === 'new' ? 'unread' : ''}" 
           onclick="handleNotificationClick('${notification.category}', '${notification.id}')">
        <div class="notification-content">
          <div class="notification-icon ${notification.type}">
            <i data-lucide="${notification.icon}"></i>
          </div>
          <div class="notification-text">
            <h4 class="notification-title">${notification.title}</h4>
            <p class="notification-description">${notification.description}</p>
            <span class="notification-time">${formatNotificationTime(notification.time)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Reinitialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

function updateNotificationBadge(count) {
  const badge = document.querySelector('.notification-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count.toString();
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function formatNotificationTime(date) {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffMs = now - notificationDate;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return notificationDate.toLocaleDateString();
}

function handleNotificationClick(category, id) {
  // Navigate to relevant page based on notification type
  switch (category) {
    case 'notes':
      window.location.href = 'notes.html';
      break;
    case 'prebooks':
      window.location.href = 'books.html'; // or a prebooks page if exists
      break;
    case 'due':
    case 'overdue':
      window.location.href = 'my-books.html';
      break;
    case 'fines':
      window.location.href = 'fines.html';
      break;
    default:
      hideNotificationPanel();
  }
}

function markNotificationsAsRead() {
  // In a real implementation, you would send a request to mark notifications as read
  // For now, we'll just visually update the badge after a short delay
  setTimeout(() => {
    updateNotificationBadge(0);
  }, 1000);
}

function markAllAsRead() {
  markNotificationsAsRead();
  hideNotificationPanel();
}

// Make functions globally available
window.toggleNotificationPanel = toggleNotificationPanel;
window.markAllAsRead = markAllAsRead;
