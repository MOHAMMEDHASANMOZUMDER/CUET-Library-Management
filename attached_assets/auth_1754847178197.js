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
    studentLoginForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const email = formData.get("email")
      const password = formData.get("password")

      // Simple validation
      if (!email || !password) {
        showNotification("Please fill in all fields", "error")
        return
      }

      showNotification("Logging in...", "info")

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        })
        if (!response.ok) {
          const errorData = await response.json()
          showNotification(errorData.message || "Login failed", "error")
          return
        }
        const data = await response.json()
        localStorage.setItem("token", data.token)
        localStorage.setItem("userType", "student")
        localStorage.setItem("userEmail", email)
        showNotification("Login successful!", "success")
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      } catch (err) {
        showNotification("Network error. Please try again.", "error")
      }
    })
  }

  // Admin login form
  const adminLoginForm = document.getElementById("admin-login-form")
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const email = formData.get("email")
      const password = formData.get("password")

      // Simple validation
      if (!email || !password) {
        showNotification("Please fill in all fields", "error")
        return
      }

      showNotification("Logging in...", "info")

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        })
        if (!response.ok) {
          const errorData = await response.json()
          showNotification(errorData.message || "Login failed", "error")
          return
        }
        const data = await response.json()
        localStorage.setItem("token", data.token)
        localStorage.setItem("userType", "admin")
        localStorage.setItem("userEmail", email)
        showNotification("Login successful!", "success")
        setTimeout(() => {
          window.location.href = "admin.html"
        }, 1000)
      } catch (err) {
        showNotification("Network error. Please try again.", "error")
      }
    })
  }

  // Registration form
  const registrationForm = document.getElementById("registration-form")
  if (studentLoginForm) {
    studentLoginForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const email = formData.get("email")
      const password = formData.get("password")

      // Simple validation
      if (!email || !password) {
        showNotification("Please fill in all fields", "error")
        return
      }

      showNotification("Logging in...", "info")

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        })
        if (!response.ok) {
          const errorData = await response.json()
          showNotification(errorData.message || "Login failed", "error")
          return
        }
        const data = await response.json()
        localStorage.setItem("token", data.token)
        localStorage.setItem("userType", "student")
        localStorage.setItem("userEmail", email)
        showNotification("Login successful!", "success")
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      } catch (err) {
        showNotification("Network error. Please try again.", "error")
      }
    })
  }

        showNotification("Account created successfully!", "success")

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      }, 1500)
