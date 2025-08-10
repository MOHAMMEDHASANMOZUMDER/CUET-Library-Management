// Authentication functionality

// Declare lucide variable
const lucide = window.lucide

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }

  // Tab functionality
  const tabButtons = document.querySelectorAll(".tab-button")
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

  // Declare showNotification function
  function showNotification(message, type) {
    console.log(`Notification (${type}): ${message}`)
  }

  // Student login form
  const studentLoginForm = document.getElementById("student-login-form")
  if (studentLoginForm) {
    studentLoginForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const studentId = formData.get("studentId")
      const password = formData.get("password")

      // Simple validation
      if (!studentId || !password) {
        showNotification("Please fill in all fields", "error")
        return
      }

      // Simulate login process
      showNotification("Logging in...", "info")

      setTimeout(() => {
        // Store user data in localStorage
        localStorage.setItem("userType", "student")
        localStorage.setItem("userId", studentId)
        localStorage.setItem("userName", "Mohammad Hasan") // Mock name

        showNotification("Login successful!", "success")

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      }, 1500)
    })
  }

  // Admin login form
  const adminLoginForm = document.getElementById("admin-login-form")
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const email = formData.get("email")
      const password = formData.get("password")

      // Simple validation
      if (!email || !password) {
        showNotification("Please fill in all fields", "error")
        return
      }

      // Simulate login process
      showNotification("Logging in...", "info")

      setTimeout(() => {
        // Store user data in localStorage
        localStorage.setItem("userType", "admin")
        localStorage.setItem("userId", email)
        localStorage.setItem("userName", "Admin User") // Mock name

        showNotification("Login successful!", "success")

        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = "admin.html"
        }, 1000)
      }, 1500)
    })
  }

  // Registration form
  const registrationForm = document.getElementById("registration-form")
  if (registrationForm) {
    registrationForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const password = formData.get("password")
      const confirmPassword = formData.get("confirmPassword")

      // Validate passwords match
      if (password !== confirmPassword) {
        showNotification("Passwords do not match", "error")
        return
      }

      // Validate required fields
      const requiredFields = ["studentId", "name", "email", "department", "session", "password"]
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          showNotification("Please fill in all required fields", "error")
          return
        }
      }

      // Simulate registration process
      showNotification("Creating account...", "info")

      setTimeout(() => {
        // Store user data in localStorage
        localStorage.setItem("userType", "student")
        localStorage.setItem("userId", formData.get("studentId"))
        localStorage.setItem("userName", formData.get("name"))

        showNotification("Account created successfully!", "success")

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      }, 1500)
    })
  }
})
