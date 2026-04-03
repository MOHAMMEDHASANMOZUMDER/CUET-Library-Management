// Notes JavaScript

// Debug helper function
function debugLog(message, data = null) {
  console.log(`[Notes Debug] ${message}`, data || '');
  
  // Also show in page if debug panel exists
  const debugInfo = document.getElementById('debug-info');
  if (debugInfo) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<span style="color: #6b7280;">[${timestamp}]</span> ${message}`;
    debugInfo.appendChild(logEntry);
    debugInfo.scrollTop = debugInfo.scrollHeight;
  }
}

document.addEventListener('DOMContentLoaded', function() {
    const userType = localStorage.getItem('userType');
    if (!userType) {
        window.location.href = 'login.html';
        return;
    }
    
    initializeTabs();
    loadNotes();
    loadNotesStats();
});

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
            
            switch(targetTab) {
                case 'browse':
                    loadBrowseNotes();
                    break;
                case 'my-notes':
                    loadMyNotes();
                    break;
            }
        });
    });
}

function loadNotes() { loadBrowseNotes(); }

async function loadBrowseNotes() {
  try {
    debugLog('Loading approved notes for browsing...');
    
    // Use public endpoint that doesn't require authentication
    const response = await fetch('/api/notes/public/approved', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    debugLog('Browse notes API response status:', response.status);

    if (!response.ok) {
            // Try to capture response body for better debugging (HTML error pages, JSON error, etc.)
            let bodyText = '';
            try { bodyText = await response.text(); } catch (e) { bodyText = '<unable to read response body>'; }
            debugLog('Non-OK response body:', bodyText);
            throw new Error(`HTTP error! status: ${response.status} - ${bodyText}`);
    }
        // Parse JSON but guard against invalid JSON (server may return HTML error page)
        let notes = [];
        try {
            notes = await response.json();
        } catch (e) {
            const text = await response.text().catch(() => '<unable to read response text>');
            debugLog('Failed to parse JSON from browse notes endpoint:', text);
            throw new Error('Invalid JSON response from server while loading browse notes');
        }
    debugLog('Loaded approved notes:', notes);
    
    // Use the existing renderNotes function with the browse-tab container
    renderNotes(notes, 'browse-tab');
    
  } catch (error) {
    debugLog('Error loading browse notes:', error.message);
    console.error('Failed to load browse notes:', error);
    
    // Show error message to user in the browse tab notes grid
    const container = document.querySelector('#browse-tab .notes-grid');
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <h3>Failed to Load Notes</h3>
          <p>There was an error loading the study notes. Please try again later.</p>
          <p class="error-details">Error: ${error.message}</p>
        </div>
      `;
    }
  }
}

async function loadMyNotes() {
    try {
        const token = localStorage.getItem('token');
        const resp = await fetch('/api/notes/user', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
        const myNotes = resp.ok ? await resp.json() : [];
        updateNotesStats({ my: (myNotes || []).length });
        renderNotes(myNotes.map(n => ({
            id: n.id,
            title: n.title || (n.book ? n.book.title : 'My Note'),
            description: n.content || `Uploaded at ${new Date(n.uploadTime).toLocaleString()}`,
            author: 'You',
            department: '',
            date: new Date(n.uploadTime).toLocaleDateString(),
            fileName: n.fileName,
            fileSize: n.fileSize,
            downloads: 0,
            rating: 0,
            views: 0,
            isOwner: true
        })), 'my-notes-tab');
    } catch {
        renderNotes([], 'my-notes-tab');
    }
}

function updateNotesStats({ total, my }) {
    if (typeof total !== 'undefined') {
        const el = document.getElementById('notes-total-count');
        if (el) el.textContent = String(total);
    }
    if (typeof my !== 'undefined') {
        const el = document.getElementById('notes-my-count');
        if (el) el.textContent = String(my);
    }
}

async function loadNotesStats() {
    try {
        // Load public stats
        const statsResponse = await fetch('/api/notes/public/stats');
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            updateNotesStats({ total: stats.approved });
        }
    } catch (error) {
        console.error('Failed to load notes stats:', error);
    }
}

function renderNotes(notes, containerId) {
    const container = document.querySelector(`#${containerId} .notes-grid`);
    if (!container) return;
    if (!notes || notes.length === 0) {
        container.innerHTML = '<p>No notes found.</p>';
        return;
    }
    
    container.innerHTML = notes.map(note => `
        <div class="note-card">
            <div class="note-header">
                <div class="note-icon">
                    <i data-lucide="${note.fileName ? 'file-text' : 'file'}"></i>
                    ${note.fileName ? '<span class="file-indicator"><i data-lucide="paperclip"></i></span>' : ''}
                </div>
                <div class="note-actions">
                    ${note.isOwner ? `
                        <button class="btn btn-small btn-outline" onclick="editNote(${note.id})" title="Edit">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="deleteNote(${note.id})" title="Delete">
                            <i data-lucide="trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="note-content">
                <h3 class="note-title">${note.title}</h3>
                <p class="note-description">${note.description || ''}</p>
                ${note.fileName ? `
                    <div class="file-info">
                        <i data-lucide="file"></i>
                        <span class="file-name">${note.fileName}</span>
                        <span class="file-size">${formatFileSize(note.fileSize || 0)}</span>
                    </div>
                ` : ''}
                <div class="note-meta">
                    <span class="note-author">by ${note.author || ''}</span>
                    <span class="note-department">${note.department || ''}</span>
                    <span class="note-date">${note.date || ''}</span>
                </div>
            </div>
            <div class="note-footer">
                ${note.fileName ? `
                    <button class="btn btn-primary btn-small" onclick="downloadNote(${note.id})">
                        <i data-lucide="download"></i>
                        Download File
                    </button>
                ` : ''}
                <button class="btn btn-outline btn-small" onclick="previewNote(${note.id})">
                    <i data-lucide="eye"></i>
                    Preview
                </button>
            </div>
        </div>
    `).join('');
    
    if (window.lucide) { lucide.createIcons(); }
}

function searchNotes() { loadBrowseNotes(); }

async function downloadNote(noteId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/notes/${noteId}/download`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('No file attached to this note');
            }
            throw new Error('Failed to download file');
        }
        
        // Get filename from response headers
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'downloaded_note';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('File downloaded successfully!', 'success');
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to download file', 'error');
    }
}

async function previewNote(noteId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/notes/${noteId}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!response.ok) throw new Error('Failed to load note details');
        
        const note = await response.json();
        
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Note Preview</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <h3>${note.title || (note.book ? note.book.title : 'Note')}</h3>
                    <p><strong>Subject:</strong> ${note.subject || 'Not specified'}</p>
                    <p><strong>Uploaded by:</strong> ${note.user ? note.user.name : 'Unknown'}</p>
                    <p><strong>Upload Date:</strong> ${new Date(note.uploadTime).toLocaleString()}</p>
                    <p><strong>Book:</strong> ${note.book ? `${note.book.title} by ${note.book.author}` : 'N/A'}</p>
                    ${note.content ? `<p><strong>Description:</strong> ${note.content}</p>` : ''}
                    ${note.fileName ? `
                        <div class="file-attachment">
                            <h4>Attached File:</h4>
                            <div class="file-info">
                                <i data-lucide="file"></i>
                                <span>${note.fileName}</span>
                                <span class="file-size">(${formatFileSize(note.fileSize || 0)})</span>
                            </div>
                        </div>
                    ` : ''}
                    <div class="preview-actions">
                        ${note.fileName ? `
                            <button class="btn btn-primary" onclick="downloadNote(${noteId})">
                                <i data-lucide="download"></i> Download File
                            </button>
                        ` : ''}
                        <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        if (window.lucide) { lucide.createIcons(); }
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to preview note', 'error');
    }
}

function shareNote(noteId) {
    showNotification('Share feature coming soon!', 'info');
}

function editNote(noteId) {
    showNotification('Edit feature coming soon!', 'info');
}

async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!response.ok) throw new Error('Failed to delete note');
        
        showNotification('Note deleted successfully!', 'success');
        loadMyNotes();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to delete note', 'error');
    }
}

function openUploadModal() {
    const modal = document.getElementById('upload-modal');
    modal.style.setProperty('display', 'flex', 'important');
    
    // Reset form
    document.getElementById('upload-form').reset();
    
    // Always reload books when opening modal
    loadBooksForUpload();
    
    // Add event listener for refresh button
    const refreshBtn = document.getElementById('refresh-books');
    if (refreshBtn) {
        refreshBtn.onclick = () => loadBooksForUpload();
    }
}

function closeUploadModal() {
    const modal = document.getElementById('upload-modal');
    modal.style.setProperty('display', 'none', 'important');
}

// Make functions globally available
window.openUploadModal = openUploadModal;
window.closeUploadModal = closeUploadModal;

// Upload form handling
document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        // Load books for selection
        loadBooksForUpload();
        
        // Setup file upload functionality
        setupFileUpload();
        
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Please login to upload notes');
                }
                
                const formData = new FormData(this);
                const file = formData.get('file');
                const isbn = formData.get('isbn');
                const title = formData.get('title');
                
                if (!file || !file.size) {
                    throw new Error('Please select a file to upload');
                }
                
                if (!isbn) {
                    throw new Error('Please select a book');
                }
                
                if (!title.trim()) {
                    throw new Error('Please enter a note title');
                }
                
                // File size validation (10MB limit)
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error('File size must be less than 10MB');
                }
                
                // Show upload progress
                const submitBtn = this.querySelector('#submitBtn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Uploading...';
                submitBtn.disabled = true;
                
                // Create a new XMLHttpRequest to properly send auth header with FormData
                const xhr = new XMLHttpRequest();
                
                xhr.open('POST', '/api/notes/upload');
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                
                xhr.onload = function() {
                    try {
                        if (xhr.status === 200) {
                            const result = JSON.parse(xhr.responseText);
                            showNotification('Note uploaded successfully! It will be reviewed by administrators.', 'success');
                            closeUploadModal();
                            uploadForm.reset();
                            resetFileUpload();
                            loadMyNotes();
                        } else {
                            throw new Error(xhr.responseText || 'Upload failed');
                        }
                    } catch (error) {
                        console.error(error);
                        showNotification(error.message || 'Upload failed', 'error');
                    } finally {
                        const submitBtn = uploadForm.querySelector('#submitBtn');
                        if (submitBtn) {
                            submitBtn.innerHTML = '<i data-lucide="upload"></i> Upload Notes';
                            submitBtn.disabled = false;
                            if (window.lucide) lucide.createIcons();
                        }
                    }
                };
                
                xhr.onerror = function() {
                    console.error('Network error during upload');
                    showNotification('Network error during upload', 'error');
                    const submitBtn = uploadForm.querySelector('#submitBtn');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i data-lucide="upload"></i> Upload Notes';
                        submitBtn.disabled = false;
                        if (window.lucide) lucide.createIcons();
                    }
                };
                
                xhr.send(formData);
                
            } catch (e) {
                console.error(e);
                showNotification(e.message || 'Upload failed', 'error');
                const submitBtn = this.querySelector('#submitBtn');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i data-lucide="upload"></i> Upload Notes';
                    submitBtn.disabled = false;
                    if (window.lucide) lucide.createIcons();
                }
            }
        });
    }
    
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('upload-modal');
        if (e.target === modal) { closeUploadModal(); }
    });
});

async function loadBooksForUpload() {
    try {
        const select = document.getElementById('book-select');
        const refreshBtn = document.getElementById('refresh-books');
        if (!select) return;
        
        // Show loading state
        select.innerHTML = '<option value="">Loading books...</option>';
        select.disabled = true;
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i>';
        }
        
        const token = localStorage.getItem('token');
        // Get all books (request larger page size to get all books for selection)
        const response = await fetch('/api/books?page=0&size=1000', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
            const result = await response.json();
            const books = result.content || result; // Handle both paginated and direct array response
            
            // Reset select with default option
            select.innerHTML = '<option value="">Select a book...</option>';
            select.disabled = false;
            
            if (books && books.length > 0) {
                books.forEach(book => {
                    const option = document.createElement('option');
                    option.value = book.isbn;
                    option.textContent = `${book.title} by ${book.author}`;
                    select.appendChild(option);
                });
                showNotification(`Loaded ${books.length} books successfully`, 'success');
            } else {
                select.innerHTML = '<option value="">No books available</option>';
                select.disabled = true;
                showNotification('No books found in the library', 'warning');
            }
        } else {
            throw new Error('Failed to load books');
        }
    } catch (error) {
        console.error('Error loading books:', error);
        const select = document.getElementById('book-select');
        if (select) {
            select.innerHTML = '<option value="">Error loading books</option>';
            select.disabled = true;
        }
        showNotification('Failed to load books. Please try again.', 'error');
    } finally {
        // Reset refresh button
        const refreshBtn = document.getElementById('refresh-books');
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i data-lucide="refresh-cw"></i>';
            if (window.lucide) lucide.createIcons();
        }
    }
}

function setupFileUpload() {
    const fileInput = document.getElementById('note-file');
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeBtn = document.getElementById('removeFile');
    const uploadContent = document.querySelector('.file-upload-content');

    if (!fileInput || !uploadArea) return;

    // File selection
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect();
        }
    });

    // Remove file
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            fileInput.value = '';
            resetFileUpload();
        });
    }

    function handleFileSelect() {
        const file = fileInput.files[0];
        if (file) {
            if (fileName) fileName.textContent = file.name;
            if (fileSize) fileSize.textContent = formatFileSize(file.size);
            if (fileInfo) fileInfo.style.display = 'flex';
            if (uploadContent) uploadContent.style.display = 'none';
        }
    }
}

function resetFileUpload() {
    const fileInfo = document.getElementById('fileInfo');
    const uploadContent = document.querySelector('.file-upload-content');
    
    if (fileInfo) fileInfo.style.display = 'none';
    if (uploadContent) uploadContent.style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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