// My Books functionality

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
})

// Book action functions
function renewBook(bookId) {
  console.log(`Renewing book ${bookId}...`)

  setTimeout(() => {
    console.log(`Book ${bookId} renewed successfully!`)
    // Update UI to show new due date
    location.reload()
  }, 1000)
}

function payFine(bookId) {
  console.log(`Redirecting to pay fine for book ${bookId}...`)
  window.location.href = "fines.html"
}

function viewBookDetails(bookId) {
  console.log(`Viewing details for book ${bookId}`)
  // In a real app, this would open a book details modal or page
}

function extendPrebook(prebookId) {
  console.log(`Extending pre-booking ${prebookId}...`)

  setTimeout(() => {
    console.log(`Pre-booking ${prebookId} extended successfully!`)
    location.reload()
  }, 1000)
}

function cancelPrebook(prebookId) {
  if (confirm("Are you sure you want to cancel this pre-booking?")) {
    console.log(`Cancelling pre-booking ${prebookId}...`)

    setTimeout(() => {
      console.log(`Pre-booking ${prebookId} cancelled successfully!`)
      location.reload()
    }, 1000)
  }
}

function borrowAgain(bookId) {
  console.log(`Pre-booking book ${bookId} again...`)
  window.location.href = "books.html"
}

function filterHistory() {
  const filter = document.getElementById("history-filter").value
  const dateFrom = document.getElementById("date-from").value
  const dateTo = document.getElementById("date-to").value

  console.log(`Filtering history: ${filter}, from: ${dateFrom}, to: ${dateTo}`)
  // In a real app, this would filter the history list
}
