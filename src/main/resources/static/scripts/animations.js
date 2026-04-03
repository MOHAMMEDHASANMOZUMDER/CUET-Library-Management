/**
 * CUET Library - Animation Utilities
 * Provides smooth animations and loading states for all pages
 */

// Apply persisted theme before other UI work
document.addEventListener('DOMContentLoaded', function() {
  try {
    const theme = localStorage.getItem('cuet-theme') || 'light';
    if (theme === 'dark') document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
  } catch (_) {}
});

// ============================================
// Page Loader
// ============================================

/**
 * Initialize page loader - call this at the start of your HTML
 */
function initPageLoader() {
  // Create loader HTML
  const loaderHTML = `
    <div class="page-loader" id="pageLoader">
      <div class="loader-content">
        <img src="images/cuet-logo.png" alt="CUET" class="loader-logo" onerror="this.style.display='none'">
        <div class="loader-spinner"></div>
        <div class="loader-text">
          Loading<span class="loader-dots"></span>
        </div>
      </div>
    </div>
  `;
  
  // Insert at the beginning of body
  if (document.body) {
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);
  }
}

/**
 * Hide page loader with smooth animation
 */
function hidePageLoader() {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    loader.classList.add('hidden');
    // Remove from DOM after animation completes
    setTimeout(() => {
      loader.remove();
    }, 500);
  }
}

/**
 * Show page loader
 */
function showPageLoader(text = 'Loading') {
  let loader = document.getElementById('pageLoader');
  if (!loader) {
    initPageLoader();
    loader = document.getElementById('pageLoader');
  }
  loader.classList.remove('hidden');
  const loaderText = loader.querySelector('.loader-text');
  if (loaderText) {
    loaderText.innerHTML = `${text}<span class="loader-dots"></span>`;
  }
}

// Auto-hide loader when page is fully loaded
window.addEventListener('load', function() {
  setTimeout(hidePageLoader, 300);
});

// ============================================
// Modal Animations
// ============================================

/**
 * Open modal with smooth animation
 * @param {string} modalId - ID of the modal backdrop element
 */
function openModalAnimated(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  
  // Trigger reflow to ensure animation plays
  modal.offsetHeight;
  
  // Focus first input after animation
  setTimeout(() => {
    const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea, button');
    if (firstInput) firstInput.focus();
  }, 100);
}

/**
 * Close modal with smooth animation
 * @param {string} modalId - ID of the modal backdrop element
 * @param {Function} callback - Optional callback after modal closes
 */
function closeModalAnimated(modalId, callback) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.classList.add('closing');
  
  setTimeout(() => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('closing');
    if (callback) callback();
  }, 300);
}

// ============================================
// Toast Notifications
// ============================================

let toastContainer = null;
let toastId = 0;

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in ms (default 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
  // Create container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 10000;';
    document.body.appendChild(toastContainer);
  }
  
  const id = `toast-${toastId++}`;
  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `toast toast-${type}`;
  
  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 20px; font-weight: bold;">${iconMap[type] || 'ℹ'}</div>
      <div style="flex: 1;">${message}</div>
      <button onclick="hideToast('${id}')" style="background: none; border: none; cursor: pointer; font-size: 18px; color: #64748b;">&times;</button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto-hide after duration
  if (duration > 0) {
    setTimeout(() => hideToast(id), duration);
  }
}

/**
 * Hide specific toast
 * @param {string} toastId - ID of toast to hide
 */
function hideToast(toastId) {
  const toast = document.getElementById(toastId);
  if (!toast) return;
  
  toast.classList.add('hiding');
  setTimeout(() => {
    toast.remove();
  }, 300);
}

// ============================================
// Progress Bar
// ============================================

let progressBar = null;

/**
 * Show progress bar at top of page
 * @param {number} width - Width percentage (0-100)
 */
function showProgressBar(width = 0) {
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);
  }
  
  progressBar.style.width = width + '%';
  
  if (width === 0) {
    progressBar.classList.add('loading');
  } else {
    progressBar.classList.remove('loading');
  }
}

/**
 * Update progress bar width
 * @param {number} width - Width percentage (0-100)
 */
function updateProgressBar(width) {
  if (progressBar) {
    progressBar.style.width = width + '%';
    
    if (width >= 100) {
      setTimeout(hideProgressBar, 300);
    }
  }
}

/**
 * Hide progress bar
 */
function hideProgressBar() {
  if (progressBar) {
    progressBar.style.width = '0';
    setTimeout(() => {
      if (progressBar) {
        progressBar.remove();
        progressBar = null;
      }
    }, 300);
  }
}

// ============================================
// Loading States
// ============================================

/**
 * Show loading spinner on button
 * @param {HTMLElement} button - Button element
 * @param {string} text - Loading text (optional)
 */
function showButtonLoading(button, text = 'Loading...') {
  if (!button) return;
  
  button.disabled = true;
  button.setAttribute('data-original-text', button.innerHTML);
  button.innerHTML = `
    <span class="spinner spinner-sm" style="margin-right: 8px;"></span>
    ${text}
  `;
}

/**
 * Hide loading spinner from button
 * @param {HTMLElement} button - Button element
 */
function hideButtonLoading(button) {
  if (!button) return;
  
  const originalText = button.getAttribute('data-original-text');
  if (originalText) {
    button.innerHTML = originalText;
    button.removeAttribute('data-original-text');
  }
  button.disabled = false;
}

/**
 * Show skeleton loading for table
 * @param {HTMLElement} tbody - Table tbody element
 * @param {number} rows - Number of skeleton rows
 * @param {number} cols - Number of columns
 */
function showTableSkeleton(tbody, rows = 5, cols = 8) {
  if (!tbody) return;
  
  tbody.innerHTML = '';
  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < cols; j++) {
      const td = document.createElement('td');
      td.innerHTML = '<div class="skeleton skeleton-text"></div>';
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

// ============================================
// Smooth Animations
// ============================================

/**
 * Animate element with shake effect (for errors)
 * @param {HTMLElement} element - Element to shake
 */
function shakeElement(element) {
  if (!element) return;
  
  element.classList.add('shake');
  setTimeout(() => {
    element.classList.remove('shake');
  }, 500);
}

/**
 * Add stagger animation to list items
 * @param {HTMLElement} container - Container element
 * @param {string} selector - Selector for items (default: children)
 */
function staggerAnimate(container, selector = null) {
  if (!container) return;
  
  const items = selector ? container.querySelectorAll(selector) : container.children;
  items.forEach((item, index) => {
    item.classList.add('stagger-item');
    item.style.animationDelay = `${index * 0.05}s`;
  });
}

/**
 * Fade in element
 * @param {HTMLElement} element - Element to fade in
 * @param {number} duration - Duration in ms
 */
function fadeIn(element, duration = 300) {
  if (!element) return;
  
  element.style.opacity = '0';
  element.style.display = 'block';
  element.style.transition = `opacity ${duration}ms ease`;
  
  setTimeout(() => {
    element.style.opacity = '1';
  }, 10);
}

/**
 * Fade out element
 * @param {HTMLElement} element - Element to fade out
 * @param {number} duration - Duration in ms
 * @param {Function} callback - Callback after fade completes
 */
function fadeOut(element, duration = 300, callback) {
  if (!element) return;
  
  element.style.transition = `opacity ${duration}ms ease`;
  element.style.opacity = '0';
  
  setTimeout(() => {
    element.style.display = 'none';
    if (callback) callback();
  }, duration);
}

/**
 * Slide down element
 * @param {HTMLElement} element - Element to slide down
 * @param {number} duration - Duration in ms
 */
function slideDown(element, duration = 300) {
  if (!element) return;
  
  element.style.display = 'block';
  element.style.overflow = 'hidden';
  element.style.height = '0';
  element.style.transition = `height ${duration}ms ease`;
  
  const height = element.scrollHeight;
  setTimeout(() => {
    element.style.height = height + 'px';
  }, 10);
  
  setTimeout(() => {
    element.style.height = '';
    element.style.overflow = '';
  }, duration);
}

/**
 * Slide up element
 * @param {HTMLElement} element - Element to slide up
 * @param {number} duration - Duration in ms
 * @param {Function} callback - Callback after slide completes
 */
function slideUp(element, duration = 300, callback) {
  if (!element) return;
  
  element.style.overflow = 'hidden';
  element.style.height = element.scrollHeight + 'px';
  element.style.transition = `height ${duration}ms ease`;
  
  setTimeout(() => {
    element.style.height = '0';
  }, 10);
  
  setTimeout(() => {
    element.style.display = 'none';
    element.style.overflow = '';
    element.style.height = '';
    if (callback) callback();
  }, duration);
}

// ============================================
// Fetch with Progress
// ============================================

/**
 * Fetch with automatic progress bar
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
async function fetchWithProgress(url, options = {}) {
  showProgressBar(10);
  
  try {
    updateProgressBar(30);
    const response = await fetch(url, options);
    updateProgressBar(70);
    
    const data = await response.json();
    updateProgressBar(100);
    
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    hideProgressBar();
    throw error;
  }
}

// ============================================
// Auto-initialize on DOM ready
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageLoader);
} else {
  initPageLoader();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initPageLoader,
    hidePageLoader,
    showPageLoader,
    openModalAnimated,
    closeModalAnimated,
    showToast,
    hideToast,
    showProgressBar,
    updateProgressBar,
    hideProgressBar,
    showButtonLoading,
    hideButtonLoading,
    showTableSkeleton,
    shakeElement,
    staggerAnimate,
    fadeIn,
    fadeOut,
    slideDown,
    slideUp,
    fetchWithProgress
  };
}
