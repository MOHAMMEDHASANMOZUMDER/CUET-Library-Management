// Notes JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first - redirect if not logged in
    const userType = localStorage.getItem('userType');
    if (!userType) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize tabs
    initializeTabs();
    
    // Load notes data
    loadNotes();
});

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
            
            // Load appropriate content
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

function loadNotes() {
    loadBrowseNotes(); // Load default tab content
}

function loadBrowseNotes() {
    // Mock notes data - replace with actual API call
    const notes = [
        {
            id: 1,
            title: 'Database Management Systems - Complete Notes',
            description: 'Comprehensive notes covering all topics from DBMS including normalization, SQL queries, and transaction management.',
            author: 'Ahmed Hassan',
            department: 'CSE',
            date: 'Jan 15, 2025',
            downloads: 234,
            rating: 4.8,
            views: 1200,
            isFavorite: false
        },
        {
            id: 2,
            title: 'Data Structures and Algorithms',
            description: 'Detailed notes on arrays, linked lists, trees, graphs, sorting and searching algorithms with examples.',
            author: 'Fatima Rahman',
            department: 'CSE',
            date: 'Jan 12, 2025',
            downloads: 189,
            rating: 4.6,
            views: 890,
            isFavorite: false
        },
        {
            id: 3,
            title: 'Circuit Analysis and Design',
            description: 'Complete notes on AC/DC circuits, Kirchhoff\'s laws, network theorems, and circuit analysis techniques.',
            author: 'Karim Abdullah',
            department: 'EEE',
            date: 'Jan 10, 2025',
            downloads: 156,
            rating: 4.7,
            views: 678,
            isFavorite: false
        },
        {
            id: 4,
            title: 'Thermodynamics Fundamentals',
            description: 'Essential concepts of thermodynamics including laws, cycles, entropy, and heat transfer mechanisms.',
            author: 'Rashid Ahmed',
            department: 'ME',
            date: 'Jan 8, 2025',
            downloads: 142,
            rating: 4.5,
            views: 567,
            isFavorite: false
        }
    ];
    
    renderNotes(notes, 'browse-tab');
}

function loadMyNotes() {
    // Mock user's notes - replace with actual API call
    const myNotes = [
        {
            id: 5,
            title: 'My Programming Notes',
            description: 'Personal collection of programming concepts and code examples.',
            author: 'You',
            department: 'CSE',
            date: 'Jan 5, 2025',
            downloads: 23,
            rating: 4.2,
            views: 156,
            isOwner: true
        }
    ];
    
    renderNotes(myNotes, 'my-notes-tab');
}

function loadFavoriteNotes() {
    // Mock favorite notes - replace with actual API call
    const favoriteNotes = [
        {
            id: 1,
            title: 'Database Management Systems - Complete Notes',
            description: 'Comprehensive notes covering all topics from DBMS including normalization, SQL queries, and transaction management.',
            author: 'Ahmed Hassan',
            department: 'CSE',
            date: 'Jan 15, 2025',
            downloads: 234,
            rating: 4.8,
            views: 1200,
            isFavorite: true
        }
    ];
    
    renderNotes(favoriteNotes, 'favorites-tab');
}

function renderNotes(notes, containerId) {
    const container = document.querySelector(`#${containerId} .notes-grid`);
    if (!container) return;
    
    container.innerHTML = notes.map(note => `
        <div class="note-card">
            <div class="note-header">
                <div class="note-icon">
                    <i data-lucide="file-text"></i>
                </div>
                <div class="note-actions">
                    ${note.isOwner ? `
                        <button class="btn-icon" onclick="editNote(${note.id})">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn-icon" onclick="deleteNote(${note.id})">
                            <i data-lucide="trash"></i>
                        </button>
                    ` : `
                        <button class="btn-icon" onclick="toggleFavorite(${note.id})">
                            <i data-lucide="heart" style="${note.isFavorite ? 'color: red; fill: red;' : ''}"></i>
                        </button>
                        <button class="btn-icon" onclick="shareNote(${note.id})">
                            <i data-lucide="share-2"></i>
                        </button>
                    `}
                </div>
            </div>
            <div class="note-content">
                <h3 class="note-title">${note.title}</h3>
                <p class="note-description">${note.description}</p>
                <div class="note-meta">
                    <span class="note-author">by ${note.author}</span>
                    <span class="note-department">${note.department}</span>
                    <span class="note-date">${note.date}</span>
                </div>
                <div class="note-stats">
                    <div class="stat">
                        <i data-lucide="download"></i>
                        <span>${note.downloads} downloads</span>
                    </div>
                    <div class="stat">
                        <i data-lucide="star"></i>
                        <span>${note.rating} rating</span>
                    </div>
                    <div class="stat">
                        <i data-lucide="eye"></i>
                        <span>${note.views} views</span>
                    </div>
                </div>
            </div>
            <div class="note-footer">
                <button class="btn btn-primary btn-small" onclick="downloadNote(${note.id})">
                    <i data-lucide="download"></i>
                    Download PDF
                </button>
                <button class="btn btn-outline btn-small" onclick="${note.isOwner ? `editNote(${note.id})` : `previewNote(${note.id})`}">
                    <i data-lucide="${note.isOwner ? 'edit' : 'eye'}"></i>
                    ${note.isOwner ? 'Edit' : 'Preview'}
                </button>
            </div>
        </div>
    `).join('');
    
    // Reinitialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function searchNotes() {
    const searchInput = document.getElementById('notes-search').value;
    const departmentFilter = document.getElementById('department-filter').value;
    const subjectFilter = document.getElementById('subject-filter').value;
    
    console.log('Searching notes:', {
        query: searchInput,
        department: departmentFilter,
        subject: subjectFilter
    });
    
    // Reload notes with filters
    loadBrowseNotes();
}

function downloadNote(noteId) {
    console.log('Downloading note:', noteId);
    alert('Note download started! The PDF will be saved to your downloads folder.');
}

function previewNote(noteId) {
    console.log('Previewing note:', noteId);
    alert('Note preview will open in a new window. This feature is coming soon!');
}

function toggleFavorite(noteId) {
    console.log('Toggling favorite for note:', noteId);
    alert('Note added to favorites!');
}

function shareNote(noteId) {
    console.log('Sharing note:', noteId);
    
    // Copy link to clipboard
    const link = `${window.location.origin}/notes.html?id=${noteId}`;
    navigator.clipboard.writeText(link).then(() => {
        alert('Share link copied to clipboard!');
    }).catch(() => {
        alert('Unable to copy link. Please copy manually: ' + link);
    });
}

function editNote(noteId) {
    console.log('Editing note:', noteId);
    alert('Note editing interface will open. This feature is coming soon!');
}

function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        console.log('Deleting note:', noteId);
        alert('Note deleted successfully!');
        loadMyNotes();
    }
}

function openUploadModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeUploadModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Upload form handling
document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const noteData = {
                title: formData.get('title'),
                description: formData.get('description'),
                subject: formData.get('subject'),
                file: formData.get('file')
            };
            
            console.log('Uploading note:', noteData);
            alert('Note uploaded successfully!');
            closeUploadModal();
            
            // Reload my notes
            loadMyNotes();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('upload-modal');
        if (e.target === modal) {
            closeUploadModal();
        }
    });
});