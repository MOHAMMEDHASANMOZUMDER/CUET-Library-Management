// Books page functionality

// Declare lucide and showNotification variables
let lucide
let showNotification

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (typeof window.lucide !== "undefined") {
    window.lucide.createIcons()
  }

  // Mock books data
  const booksData = [
    {
      id: 1,
      title: "Database Management Systems",
      author: "Raghu Ramakrishnan",
      isbn: "978-0072465631",
      department: "CSE",
      category: "Textbook",
      available: 3,
      total: 5,
      rating: 4.5,
      image: "https://via.placeholder.com/150x200?text=DBMS",
    },
    {
      id: 2,
      title: "Software Engineering",
      author: "Ian Sommerville",
      isbn: "978-0133943030",
      department: "CSE",
      category: "Textbook",
      available: 0,
      total: 4,
      rating: 4.3,
      image: "https://via.placeholder.com/150x200?text=SE",
    },
    {
      id: 3,
      title: "Computer Networks",
      author: "Andrew S. Tanenbaum",
      isbn: "978-0132126953",
      department: "CSE",
      category: "Textbook",
      available: 2,
      total: 3,
      rating: 4.7,
      image: "https://via.placeholder.com/150x200?text=Networks",
    },
    {
      id: 4,
      title: "Digital Signal Processing",
      author: "John G. Proakis",
      isbn: "978-0131873742",
      department: "EEE",
      category: "Reference",
      available: 1,
      total: 2,
      rating: 4.2,
      image: "https://via.placeholder.com/150x200?text=DSP",
    },
    {
      id: 5,
      title: "Thermodynamics",
      author: "Yunus A. Cengel",
      isbn: "978-0073398174",
      department: "ME",
      category: "Textbook",
      available: 4,
      total: 6,
      rating: 4.4,
      image: "https://via.placeholder.com/150x200?text=Thermo",
    },
    {
      id: 6,
      title: "Structural Analysis",
      author: "Russell C. Hibbeler",
      isbn: "978-0134610672",
      department: "CE",
      category: "Textbook",
      available: 2,
      total: 4,
      rating: 4.1,
      image: "https://via.placeholder.com/150x200?text=Structural",
    },
  ]

  let filteredBooks = [...booksData]

  // Display books
  function displayBooks(books) {
    const booksContainer = document.getElementById("books-container")
    const resultsCount = document.getElementById("results-count")

    if (booksContainer) {
      booksContainer.innerHTML = books
        .map(
          (book) => `
                <div class="book-card">
                    <div class="book-header">
                        <div class="book-image-container">
                            <img src="${book.image}" alt="${book.title}" class="book-image">
                        </div>
                        <div class="book-basic-info">
                            <h3 class="book-title">${book.title}</h3>
                            <p class="book-author">by ${book.author}</p>
                        </div>
                    </div>
                    <div class="book-content">
                        <div class="book-badges">
                            <span class="badge badge-outline">${book.department}</span>
                            <span class="badge badge-secondary">${book.category}</span>
                        </div>
                        
                        <div class="book-rating">
                            <i data-lucide="star" class="star-icon"></i>
                            <span>${book.rating}</span>
                        </div>
                        
                        <div class="book-availability">
                            <span>Available: ${book.available}/${book.total}</span>
                            <span class="book-isbn">ISBN: ${book.isbn}</span>
                        </div>
                        
                        <div class="book-actions">
                            <button class="btn btn-outline btn-small" onclick="viewBookDetails(${book.id})">View Details</button>
                            ${
                              book.available > 0
                                ? `<button class="btn btn-primary btn-small" onclick="prebookBook(${book.id})">Pre-book</button>`
                                : `<button class="btn btn-small" disabled>Not Available</button>`
                            }
                        </div>
                    </div>
                </div>
            `,
        )
        .join("")

      // Re-initialize Lucide icons for new content
      if (typeof window.lucide !== "undefined") {
        window.lucide.createIcons()
      }
    }

    if (resultsCount) {
      resultsCount.textContent = `Showing ${books.length} of ${booksData.length} books`
    }
  }

  // Search functionality
  window.searchBooks = () => {
    const searchInput = document.getElementById("search-input").value.toLowerCase()
    const departmentFilter = document.getElementById("department-filter").value
    const categoryFilter = document.getElementById("category-filter").value

    filteredBooks = booksData.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchInput) || book.author.toLowerCase().includes(searchInput)
      const matchesDepartment = departmentFilter === "all" || book.department === departmentFilter
      const matchesCategory = categoryFilter === "all" || book.category === categoryFilter

      return matchesSearch && matchesDepartment && matchesCategory
    })

    displayBooks(filteredBooks)
  }

  // Book actions
  window.viewBookDetails = (bookId) => {
    const book = booksData.find((b) => b.id === bookId)
    if (book) {
      // Placeholder for showNotification function
      console.log(`Viewing details for "${book.title}"`)
      // In a real app, this would navigate to a book details page
    }
  }

  window.prebookBook = (bookId) => {
    const book = booksData.find((b) => b.id === bookId)
    if (book && book.available > 0) {
      // Placeholder for showNotification function
      console.log(`Pre-booking "${book.title}"...`)

      setTimeout(() => {
        // Update availability
        book.available--
        displayBooks(filteredBooks)
        // Placeholder for showNotification function
        console.log(`Successfully pre-booked "${book.title}"!`)
      }, 1000)
    }
  }

  // Real-time search
  const searchInput = document.getElementById("search-input")
  if (searchInput) {
    searchInput.addEventListener("input", window.searchBooks)
  }

  const departmentFilter = document.getElementById("department-filter")
  if (departmentFilter) {
    departmentFilter.addEventListener("change", window.searchBooks)
  }

  const categoryFilter = document.getElementById("category-filter")
  if (categoryFilter) {
    categoryFilter.addEventListener("change", window.searchBooks)
  }

  // Initial display
  displayBooks(filteredBooks)
})
