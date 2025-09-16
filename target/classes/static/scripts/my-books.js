// My Books JavaScript
let currentRenewalBookId = null;

document.addEventListener("DOMContentLoaded", function () {
  const userType = localStorage.getItem("userType");
  if (!userType) {
    window.location.href = "login.html";
    return;
  }

  initializeTabs();
  loadMyBooks();
});

function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      this.classList.add("active");
      document.getElementById(targetTab + "-tab").classList.add("active");

      switch (targetTab) {
        case "borrowed":
          loadBorrowedBooks();
          break;
        case "reservations":
          loadReservations();
          break;
        case "history":
          loadBorrowingHistory();
          break;
      }
    });
  });
}

function loadMyBooks() {
  loadBorrowedBooks();
}

async function loadBorrowedBooks() {
  try {
    const token = localStorage.getItem('token');
    const resp = await fetch('/api/borrow/my-active-borrows', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    if (!resp.ok) throw new Error('Failed to load active borrows');
    const records = await resp.json();

    const mapped = records.map(r => ({
      id: r.id,
      title: r.book?.title,
      author: r.book?.author,
      borrowDate: r.borrowDate,
      dueDate: r.dueDate,
      image: 'images/book-placeholder.png',
      fine: 0,
      status: 'normal',
      canRenew: false,
      renewalsUsed: 0,
      maxRenewals: 0
    }));
    renderBorrowedBooks(mapped);
  } catch (e) {
    console.error(e);
    renderBorrowedBooks([]);
  }
}

function renderBorrowedBooks(books) {
  const container = document.getElementById("borrowed-books");
  if (!container) return;

  if (!books || books.length === 0) {
    container.innerHTML = '<p>No active borrows.</p>';
    return;
  }

  container.innerHTML = books
    .map((book) => {
      const statusClass = 'normal';

      return `
            <div class="borrowed-book-item ${statusClass}">
                <div class="book-image">
                    <img src="${book.image}" alt="${book.title}">
                </div>
                <div class="book-details">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">by ${book.author || ''}</p>
                    <div class="book-dates">
                        <div class="date-info">
                            <span class="label">Borrowed:</span>
                            <span class="date">${formatDate(book.borrowDate)}</span>
                        </div>
                        <div class="date-info ${statusClass}">
                            <span class="label">Due:</span>
                            <span class="date">${formatDate(book.dueDate)}</span>
                        </div>
                    </div>
                </div>
                <div class="book-actions">
                    <button class="btn btn-outline" onclick="returnBook(${book.id})">
                        <i data-lucide="arrow-left"></i>
                        Return Book
                    </button>
                </div>
            </div>
        `;
    })
    .join("");

  if (window.lucide) {
    lucide.createIcons();
  }
}

async function loadReservations() {
  try {
    const token = localStorage.getItem('token');
    const resp = await fetch('/api/prebooks/user', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    if (!resp.ok) throw new Error('Failed to load pre-books');
    const prebooks = await resp.json();

    const container = document.getElementById("reserved-books");
    if (!container) return;

    if (!prebooks || prebooks.length === 0) {
      container.innerHTML = `<div class="empty-state"><h3>No Reservations</h3></div>`;
      return;
    }

    container.innerHTML = prebooks.map(pb => `
        <div class="reserved-book-item ${pb.status}">
            <div class="book-details">
                <h3 class="book-title">${pb.book?.title}</h3>
                <p class="book-author">by ${pb.book?.author || ''}</p>
                <div class="reservation-dates">
                    <div class="date-info">
                        <span class="label">Requested:</span>
                        <span class="date">${formatDate(pb.requestDate)}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  } catch (e) {
    console.error(e);
  }
}

async function loadBorrowingHistory() {
  try {
    const token = localStorage.getItem('token');
    const resp = await fetch('/api/borrow/my-borrows', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    const history = resp.ok ? await resp.json() : [];
    renderHistory(history.map(r => ({
      image: 'images/book-placeholder.png',
      title: r.book?.title,
      author: r.book?.author,
      isbn: '',
      borrowDate: r.borrowDate,
      returnDate: r.returnDate,
      status: r.returnDate ? 'returned' : 'pending',
      fine: 0
    })));
  } catch {
    renderHistory([]);
  }
}

function renderHistory(history) {
  const container = document.getElementById("history-books");
  if (!container) return;

  if (!history || history.length === 0) {
    container.innerHTML = '<p>No history.</p>';
    return;
  }

  container.innerHTML = `
        <div class="history-table" style="width: 100%; font-family: Arial, sans-serif; border-collapse: collapse;">
            <table style="width: 100%;">
                <thead >
                    <tr>
                        <th style="padding: 12px 15px; border: 0.5px solid #ddd;">Book</th>
                        <th style="padding: 12px 15px; border: 0.5px solid #ddd;">Borrow Date</th>
                        <th style="padding: 12px 15px; border: 0.5px solid #ddd;">Return Date</th>
                        <th style="padding: 12px 15px; border: 0.5px solid #ddd;">Status</th>
                        <th style="padding: 12px 15px; border: 0.5px solid #ddd;">Fine</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(record => `
                        <tr>
                           <td style="padding: 12px 15px;">
                                <div class="book-info" style="display: flex; align-items: center;">
                                <img style="width: 60px; height: auto; margin-right: 15px; border-radius: 4px;" src="${record.image}" alt="${record.title}" class="book-image">
                                <div class="text-container" style="display: flex; flex-direction: column;">
                                <h2 style="color: #0aeb06dd; margin: 0;" class="book-title">${record.title}</h2>
                                <p style="color: #ddd; margin: 0;" class="book-author">by ${record.author || ''}</p>
                                </div>
                                </div>
                            </td>
                            <td>${formatDate(record.borrowDate)}</td>
                            <td>${record.returnDate ? formatDate(record.returnDate) : '-'}</td>
                            <td><span class="status-badge ${record.status}">${record.status}</span></td>
                            <td>${record.fine > 0 ? `৳${record.fine}` : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function returnBook(borrowRecordId) {
  if (!confirm('Return this book?')) return;
  try {
    const token = localStorage.getItem('token');
    const resp = await fetch(`/api/borrow/return/${encodeURIComponent(borrowRecordId)}`, {
      method: 'PUT',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!resp.ok) throw new Error(await resp.text());
    alert('Return successful');
    loadBorrowedBooks();
  } catch (e) {
    alert(e.message || 'Return failed');
  }
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

window.addEventListener("click", function (e) {
  const renewalModal = document.getElementById("renewal-modal");
  if (e.target === renewalModal) {
    document.getElementById("renewal-modal").style.display = "none";
    currentRenewalBookId = null;
  }
});

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "styles/main.css";
document.head.appendChild(link);
