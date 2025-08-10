// FAQ functionality

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (typeof window.lucide !== "undefined") {
    window.lucide.createIcons()
  }

  // FAQ search functionality
  const searchInput = document.getElementById("faq-search")
  const categoryButtons = document.querySelectorAll(".category-btn")
  const faqItems = document.querySelectorAll(".faq-item")

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener("input", filterFAQs)
  }

  // Category filter functionality
  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      categoryButtons.forEach((btn) => btn.classList.remove("active"))
      // Add active class to clicked button
      this.classList.add("active")

      const category = this.getAttribute("data-category")
      filterFAQs(category)
    })
  })

  // FAQ accordion functionality
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")
    const answer = item.querySelector(".faq-answer")
    const icon = question.querySelector("i")

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open")

      // Close all other FAQ items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("open")
          const otherAnswer = otherItem.querySelector(".faq-answer")
          const otherIcon = otherItem.querySelector(".faq-question i")
          if (otherAnswer) otherAnswer.style.maxHeight = "0"
          if (otherIcon) otherIcon.style.transform = "rotate(0deg)"
        }
      })

      // Toggle current item
      if (isOpen) {
        item.classList.remove("open")
        answer.style.maxHeight = "0"
        icon.style.transform = "rotate(0deg)"
      } else {
        item.classList.add("open")
        answer.style.maxHeight = answer.scrollHeight + "px"
        icon.style.transform = "rotate(180deg)"
      }
    })
  })

  function filterFAQs(category = null) {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""
    const activeCategory =
      category || document.querySelector(".category-btn.active")?.getAttribute("data-category") || "all"

    faqItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category")
      const questionText = item.querySelector(".faq-question h3").textContent.toLowerCase()
      const answerText = item.querySelector(".faq-answer").textContent.toLowerCase()

      const matchesSearch = questionText.includes(searchTerm) || answerText.includes(searchTerm)
      const matchesCategory = activeCategory === "all" || itemCategory === activeCategory

      if (matchesSearch && matchesCategory) {
        item.style.display = "block"
      } else {
        item.style.display = "none"
      }
    })
  }
})
