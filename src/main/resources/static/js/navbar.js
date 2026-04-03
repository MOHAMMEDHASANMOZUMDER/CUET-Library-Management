// ========== UNIFIED NAVBAR JAVASCRIPT ==========

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  // Add mobile menu button if not present
  const header = document.querySelector('.header');
  if (!header) return;

  // Add nav-toggle button for mobile view
  const container = header.querySelector('.container');
  const navLinksAndActions = header.querySelector('.nav-links, .header-actions');
  
  // Initialize icon renderer
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

// Toggle notification panel
function toggleNotificationPanel() {
  const panel = document.getElementById('notificationPanel');
  const btn = document.getElementById('notificationBtn');
  
  if (!panel || !btn) return;
  
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  btn.classList.toggle('active');
  
  // Close when clicking outside
  document.addEventListener('click', function(e) {
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
      panel.style.display = 'none';
      btn.classList.remove('active');
    }
  });
}

// Mark all notifications as read
function markAllAsRead() {
  const notificationItems = document.querySelectorAll('.notification-item.unread');
  notificationItems.forEach(item => {
    item.classList.remove('unread');
  });
  
  const badge = document.getElementById('notificationBadge');
  if (badge) {
    badge.style.display = 'none';
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const dropdownMenus = document.querySelectorAll('.dropdown-menu.active');
  dropdownMenus.forEach(menu => {
    if (!menu.closest('.user-menu').contains(e.target)) {
      menu.classList.remove('active');
    }
  });
});

// Close mobile menu when a link is clicked
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('nav-link')) {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && navLinks.classList.contains('mobile-active')) {
      navLinks.classList.remove('mobile-active');
    }
  }
});

// Set active nav link based on current page
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// Render Lucide icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}
