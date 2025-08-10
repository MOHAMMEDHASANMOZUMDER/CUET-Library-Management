// Admin dashboard functionality

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  const lucide = window.lucide // Declare the lucide variable
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }

  // Check if user is admin
  const userType = localStorage.getItem("userType")
  if (userType !== "admin") {
    window.location.href = "login.html"
    return
  }

  // Load admin dashboard data
  loadAdminData()

  function loadAdminData() {
    // Mock admin data
    const adminData = {
      totalBooks: 10247,
      availableBooks: 8932,
      activeStudents: 3876,
      totalStudents: 5432,
      pendingFines: 15750,
      fineStudents: 125,
      studyNotes: 1234,
      pendingNotes: 23,
    }

    updateAdminStats(adminData)
  }

  function updateAdminStats(data) {
    const statNumbers = document.querySelectorAll(".stat-number")
    const statDescriptions = document.querySelectorAll(".stat-description")

    if (statNumbers.length >= 4) {
      statNumbers[0].textContent = data.totalBooks.toLocaleString()
      statNumbers[1].textContent = data.activeStudents.toLocaleString()
      statNumbers[2].textContent = `৳${data.pendingFines.toLocaleString()}`
      statNumbers[3].textContent = data.studyNotes.toLocaleString()
    }

    if (statDescriptions.length >= 4) {
      statDescriptions[0].textContent = `${data.availableBooks.toLocaleString()} available`
      statDescriptions[1].textContent = `of ${data.totalStudents.toLocaleString()} registered`
      statDescriptions[2].textContent = `${data.fineStudents} students`
      statDescriptions[3].textContent = `${data.pendingNotes} pending review`
    }
  }
})

// Logout function
function logout() {
  localStorage.clear()
  const showNotification = window.showNotification // Declare the showNotification variable
  if (typeof showNotification !== "undefined") {
    showNotification("Logged out successfully", "success")
  }
  setTimeout(() => {
    window.location.href = "index.html"
  }, 1000)
}
