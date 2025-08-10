// Help page functionality

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (typeof window.lucide !== "undefined") {
    window.lucide.createIcons()
  }
})

function openContactForm() {
  const modal = document.getElementById("contact-modal")
  modal.style.display = "flex"
}

function closeContactForm() {
  const modal = document.getElementById("contact-modal")
  modal.style.display = "none"
  document.getElementById("contact-form").reset()
}

function submitContactForm() {
  const form = document.getElementById("contact-form")
  const formData = new FormData(form)

  // Validate required fields
  const name = formData.get("name")
  const email = formData.get("email")
  const category = formData.get("category")
  const subject = formData.get("subject")
  const message = formData.get("message")

  if (!name || !email || !category || !subject || !message) {
    alert("Please fill in all required fields")
    return
  }

  console.log("Submitting support request...")

  setTimeout(() => {
    console.log("Support request submitted successfully!")
    closeContactForm()
    alert("Your message has been sent. We'll get back to you within 2-4 hours.")
  }, 1500)
}
