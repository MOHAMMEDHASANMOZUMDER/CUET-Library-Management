// Fines page functionality

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (typeof window.lucide !== "undefined") {
    window.lucide.createIcons()
  }

  // File upload handling
  const screenshotInput = document.getElementById("screenshot-input")
  const uploadArea = document.querySelector(".upload-area")

  if (screenshotInput && uploadArea) {
    uploadArea.addEventListener("click", () => {
      screenshotInput.click()
    })

    screenshotInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        const fileName = file.name
        uploadArea.innerHTML = `
          <i data-lucide="check-circle"></i>
          <p>File selected: ${fileName}</p>
        `
        // Re-initialize icons
        if (typeof window.lucide !== "undefined") {
          window.lucide.createIcons()
        }
      }
    })
  }
})

function payFine(fineId, amount) {
  // Open payment modal
  const modal = document.getElementById("payment-modal")
  const bookTitle = document
    .querySelector(`[onclick="payFine(${fineId}, ${amount})"]`)
    .closest(".fine-item")
    .querySelector("h4").textContent

  document.getElementById("payment-book-title").textContent = bookTitle
  document.getElementById("payment-fine-amount").textContent = `Amount: ৳${amount}`
  document.getElementById("instruction-amount").textContent = `৳${amount}`
  document.getElementById("instruction-reference").textContent = `LIB-FINE-${String(fineId).padStart(3, "0")}`

  modal.style.display = "flex"
}

function payAllFines() {
  payFine("ALL", 90)
}

function viewFineDetails(fineId) {
  console.log(`Viewing details for fine ${fineId}`)
  // In a real app, this would show detailed fine information
}

function closePaymentModal() {
  const modal = document.getElementById("payment-modal")
  modal.style.display = "none"
}

function submitPayment() {
  const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value
  const screenshot = document.getElementById("screenshot-input").files[0]

  if (!screenshot) {
    alert("Please upload a transaction screenshot")
    return
  }

  console.log(`Submitting payment via ${selectedMethod}...`)

  setTimeout(() => {
    console.log("Payment submitted successfully!")
    closePaymentModal()
    location.reload()
  }, 1500)
}
