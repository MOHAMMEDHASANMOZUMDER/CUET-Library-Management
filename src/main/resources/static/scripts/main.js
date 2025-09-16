// Main JavaScript for the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Mobile menu toggle (if needed)
    initializeMobileMenu();
    
    // Initialize any common components
    initializeComponents();
});

function initializeMobileMenu() {
    // Add mobile menu functionality if needed
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
}

function initializeComponents() {
    // Initialize any tooltips, dropdowns, or other components
    initializeDropdowns();
    initializeModals();
}

function initializeDropdowns() {
    // Handle dropdown menus
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropbtn');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (trigger && content) {
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.querySelector('.dropdown-content').style.display = 'none';
                    }
                });
                
                // Toggle current dropdown
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        dropdowns.forEach(dropdown => {
            const content = dropdown.querySelector('.dropdown-content');
            if (content) {
                content.style.display = 'none';
            }
        });
    });
}

function initializeModals() {
    // Handle modal close buttons
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
    return `৳${amount}`;
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

// API helper functions (to be replaced with actual API calls)
function apiCall(endpoint, options = {}) {
    // Mock API call - replace with actual implementation
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`API call to ${endpoint}:`, options);
            
            // Mock successful response
            resolve({
                success: true,
                data: {},
                message: 'Operation completed successfully'
            });
        }, 500);
    });
}
document.addEventListener("DOMContentLoaded", () => {
  const scroller = document.querySelector(".scroll-stack-scroller");
  const cards = Array.from(document.querySelectorAll(".scroll-stack-card"));

  // Setup Lenis
  const lenis = new Lenis({
    wrapper: scroller,
    content: scroller.querySelector(".scroll-stack-inner"),
    smoothWheel: true,
    duration: 1.2,
  });

  function calculateProgress(scrollTop, start, end) {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }

  function updateCardTransforms() {
    const scrollTop = scroller.scrollTop;
    const containerHeight = scroller.clientHeight;

    cards.forEach((card, i) => {
      const cardTop = card.offsetTop;
      const triggerStart = cardTop - containerHeight * 0.2 - (30 * i);
      const triggerEnd = cardTop - containerHeight * 0.1;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = 0.85 + (i * 0.03);
      const scale = 1 - scaleProgress * (1 - targetScale);

      const translateY = Math.max(0, scrollTop - cardTop + containerHeight * 0.2 + (30 * i));

      card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
    });
  }

  // Attach scroll updates
  scroller.addEventListener("scroll", updateCardTransforms);

  // Lenis RAF loop
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
});
