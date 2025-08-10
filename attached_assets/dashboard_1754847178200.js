// Dashboard functionality

// Import Lucide icons library
import lucide from "lucide"

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }

  // Check if user is logged in
  const userType = localStorage.getItem("userType")
  const userName = localStorage.getItem("userName")

  if (!userType) {
    window.location.href = "login.html"
    return
  }

  // Update welcome message
  const welcomeTitle = document.querySelector(".welcome-title")
  if (welcomeTitle && userName) {
    welcomeTitle.textContent = `Welcome back, ${userName}!`
  }

  // Simulate loading dashboard data
  loadDashboardData()

  function loadDashboardData() {
    // This would normally fetch data from an API
    // For now, we'll use mock data

    const mockData = {
      borrowedBooks: 3,
      outstandingFines: 50,
      notesUploaded: 12,
      prebookings: 1,
      recentActivity: [
        { book: "Database Management Systems", action: "Borrowed", date: "2025-01-15" },
        { book: "Software Engineering", action: "Renewed", date: "2025-01-14" },
        { book: "Computer Networks", action: "Returned", date: "2025-01-12" },
      ],
      upcomingDueDates: [
        { book: "Database Management Systems", dueDate: "2025-02-15", daysLeft: 25 },
        { book: "Software Engineering", dueDate: "2025-02-20", daysLeft: 30 },
      ],
    }

    // Update stats
    updateStats(mockData)

    // Update activity lists
    updateActivityList(mockData.recentActivity)
    updateDueDatesList(mockData.upcomingDueDates)
  }

  function updateStats(data) {
    const statNumbers = document.querySelectorAll(".stat-number")
    if (statNumbers.length >= 4) {
      statNumbers[0].textContent = data.borrowedBooks
      statNumbers[1].textContent = `৳${data.outstandingFines}`
      statNumbers[2].textContent = data.notesUploaded
      statNumbers[3].textContent = data.prebookings
    }
  }

  function updateActivityList(activities) {
    const activityList = document.querySelector(".activity-list")
    if (activityList) {
      activityList.innerHTML = activities
        .map(
          (activity) => `
                <div class="activity-item">
                    <div class="activity-info">
                        <p class="activity-title">${activity.book}</p>
                        <p class="activity-date">${activity.action} on ${activity.date}</p>
                    </div>
                    <span class="badge badge-${activity.action === "Borrowed" ? "primary" : "secondary"}">${activity.action}</span>
                </div>
            `,
        )
        .join("")
    }
  }

  function updateDueDatesList(dueDates) {
    const dueList = document.querySelector(".due-list")
    if (dueList) {
      dueList.innerHTML = dueDates
        .map(
          (item) => `
                <div class="due-item">
                    <div class="due-info">
                        <p class="due-title">${item.book}</p>
                        <p class="due-date">Due: ${item.dueDate}</p>
                    </div>
                    <span class="badge badge-${item.daysLeft <= 7 ? "warning" : "primary"}">${item.daysLeft} days left</span>
                </div>
            `,
        )
        .join("")
    }
  }
})
