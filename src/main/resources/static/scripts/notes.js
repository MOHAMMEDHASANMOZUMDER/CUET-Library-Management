// Notes JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const userType = localStorage.getItem('userType');
    if (!userType) {
        window.location.href = 'login.html';
        return;
    }
    
    initializeTabs();
    loadNotes();
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
                case 'favorites':
                    loadFavoriteNotes();
                    break;
            }
        });
    });
}

function loadNotes() { loadBrowseNotes(); }

async function loadBrowseNotes() {
    try {
        const resp = await fetch('/api/notes/admin/all');
        const notes = resp.ok ? await resp.json() : [];
        renderNotes(notes.map(n => ({
            id: n.id,
            title: n.book ? n.book.title : 'Note',
            description: `Uploaded at ${new Date(n.uploadTime).toLocaleString()}`,
            author: n.user ? n.user.name : 'User',
            department: n.user ? (n.user.department || '') : '',
            date: new Date(n.uploadTime).toLocaleDateString(),
            downloads: 0,
            rating: 0,
            views: 0,
            isFavorite: false
        })), 'browse-tab');
    } catch {
        renderNotes([], 'browse-tab');
    }
}

async function loadMyNotes() {
    try {
        const token = localStorage.getItem('token');
        const resp = await fetch('/api/notes/user', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
        const myNotes = resp.ok ? await resp.json() : [];
        renderNotes(myNotes.map(n => ({
            id: n.id,
            title: n.book ? n.book.title : 'My Note',
            description: `Uploaded at ${new Date(n.uploadTime).toLocaleString()}`,
            author: 'You',
            department: '',
            date: new Date(n.uploadTime).toLocaleDateString(),
            downloads: 0,
            rating: 0,
            views: 0,
            isOwner: true
        })), 'my-notes-tab');
    } catch {
        renderNotes([], 'my-notes-tab');
    }
}

function loadFavoriteNotes() {
    renderNotes([], 'favorites-tab');
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
                    <i data-lucide="file-text"></i>
                </div>
                <div class="note-actions">
                </div>
            </div>
            <div class="note-content">
                <h3 class="note-title">${note.title}</h3>
                <p class="note-description">${note.description || ''}</p>
                <div class="note-meta">
                    <span class="note-author">by ${note.author || ''}</span>
                    <span class="note-department">${note.department || ''}</span>
                    <span class="note-date">${note.date || ''}</span>
                </div>
            </div>
            <div class="note-footer">
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

function previewNote(noteId) { alert('Preview coming soon'); }

function toggleFavorite(noteId) { }

function shareNote(noteId) { }

function editNote(noteId) { }

function deleteNote(noteId) { }

function openUploadModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) { modal.style.display = 'block'; }
}

function closeUploadModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) { modal.style.display = 'none'; }
}

// Upload form handling
document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            try {
                const token = localStorage.getItem('token');
                const formData = new FormData(this);
                const bookId = formData.get('bookId');
                const resp = await fetch(`/api/notes?bookId=${encodeURIComponent(bookId)}`, {
                    method: 'POST',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (!resp.ok) throw new Error(await resp.text());
                alert('Note uploaded successfully!');
                closeUploadModal();
                loadMyNotes();
            } catch (e) {
                alert(e.message || 'Upload failed');
            }
        });
    }
    
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('upload-modal');
        if (e.target === modal) { closeUploadModal(); }
    });
});