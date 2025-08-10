// Notes page functionality

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (typeof window.lucide !== "undefined") {
    window.lucide.createIcons()
  }

  // Tab functionality
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab")

      // Remove active class from all tabs
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked tab
      this.classList.add("active")
      document.getElementById(tabName + "-tab").classList.add("active")
    })
  })

  // File upload handling
  const noteFileInput = document.getElementById("note-file")
  const uploadArea = document.querySelector(".upload-area")

  if (noteFileInput && uploadArea) {
    uploadArea.addEventListener("click", () => {
      noteFileInput.click()
    })

    noteFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        const fileName = file.name
        const fileSize = (file.size / 1024 / 1024).toFixed(2)
        uploadArea.innerHTML = `
          <i data-lucide="file-text"></i>
          <p>File selected: ${fileName}</p>
          <small>Size: ${fileSize} MB</small>
        `
        // Re-initialize icons
        if (typeof window.lucide !== "undefined") {
          window.lucide.createIcons()
        }
      }
    })
  }
})

// Search functionality
function searchNotes() {
  const searchTerm = document.getElementById("notes-search").value
  const department = document.getElementById("department-filter").value
  const subject = document.getElementById("subject-filter").value

  console.log(`Searching notes: ${searchTerm}, dept: ${department}, subject: ${subject}`)
  // In a real app, this would filter the notes
}

// Note actions
function downloadNote(noteId) {
  console.log(`Downloading note ${noteId}...`)
  // In a real app, this would trigger file download
}

function previewNote(noteId) {
  console.log(`Previewing note ${noteId}`)
  // In a real app, this would open a preview modal
}

function toggleFavorite(noteId) {
  console.log(`Toggling favorite for note ${noteId}`)
  // In a real app, this would update favorite status
}

function shareNote(noteId) {
  console.log(`Sharing note ${noteId}`)
  // In a real app, this would open share options
}

function editNote(noteId) {
  console.log(`Editing note ${noteId}`)
  // In a real app, this would open edit form
}

function deleteNote(noteId) {
  if (confirm("Are you sure you want to delete this note?")) {
    console.log(`Deleting note ${noteId}...`)
    // In a real app, this would delete the note
  }
}

// Modal functions
function openUploadModal() {
  const modal = document.getElementById("upload-modal")
  modal.style.display = "flex"
}

function closeUploadModal() {
  const modal = document.getElementById("upload-modal")
  modal.style.display = "none"
  document.getElementById("upload-form").reset()
}

function submitNote() {
  const form = document.getElementById("upload-form")
  const formData = new FormData(form)

  // Validate required fields
  const title = formData.get("title")
  const description = formData.get("description")
  const department = formData.get("department")
  const file = formData.get("file")

  if (!title || !description || !department || !file) {
    alert("Please fill in all required fields")
    return
  }

  console.log("Uploading note...")

  setTimeout(() => {
    console.log("Note uploaded successfully!")
    closeUploadModal()
    location.reload()
  }, 2000)
}
