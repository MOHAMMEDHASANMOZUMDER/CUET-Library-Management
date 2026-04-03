// Fines JS - REWRITTEN FOR NEW WORKFLOW

let allFines = [];
let currentFineForModal = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return; // checkAuth is from auth.js
    loadFinesData();

    const proofForm = document.getElementById('payment-proof-form');
    if (proofForm) {
        proofForm.addEventListener('submit', handleProofSubmission);
    }
});

async function loadFinesData() {
    try {
        allFines = await LibraryApiService.request('/fines/user');
        updateSummaryCards();
        renderTables();
    } catch (error) {
        console.error("Failed to load fines data:", error);
        allFines = [];
        updateSummaryCards();
        renderTables();
    }
}

function updateSummaryCards() {
    const unpaidFines = allFines.filter(f => f.status === 'UNPAID');
    const pendingFines = allFines.filter(f => f.status === 'PENDING_VERIFICATION');
    const paidFines = allFines.filter(f => f.status === 'PAID');

    const totalUnpaidAmount = unpaidFines.reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalPaidAmount = paidFines.reduce((sum, f) => sum + (f.amount || 0), 0);

    document.getElementById('total-unpaid').textContent = `৳${totalUnpaidAmount.toFixed(2)}`;
    document.getElementById('pending-verification').textContent = pendingFines.length;
    document.getElementById('total-paid').textContent = `৳${totalPaidAmount.toFixed(2)}`;
}

function renderTables() {
    const outstandingFines = allFines.filter(f => f.status !== 'PAID');
    const paymentHistory = allFines.filter(f => f.status === 'PAID' || f.status === 'PENDING_VERIFICATION');

    const outstandingBody = document.getElementById('outstanding-fines-body');
    const historyBody = document.getElementById('payment-history-body');

    outstandingBody.innerHTML = outstandingFines.length ? outstandingFines.map(fine => `
        <tr>
            <td>${fine.id}</td>
            <td>${escapeHtml(fine.borrowRecord?.book?.title || 'N/A')}</td>
            <td>৳${fine.amount.toFixed(2)}</td>
            <td><span class="status-badge status-${fine.status.toLowerCase()}">${formatStatus(fine.status)}</span></td>
            <td>${renderActionButtons(fine)}</td>
        </tr>
    `).join('') : '<tr><td colspan="5">No outstanding fines.</td></tr>';
    
    historyBody.innerHTML = paymentHistory.length ? paymentHistory.map(fine => `
        <tr>
            <td>${fine.id}</td>
            <td>${escapeHtml(fine.trXID || 'N/A')}</td>
            <td>৳${fine.amount.toFixed(2)}</td>
            <td><span class="status-badge status-${fine.status.toLowerCase()}">${formatStatus(fine.status)}</span></td>
            <td>${fine.paymentSubmissionDate ? new Date(fine.paymentSubmissionDate).toLocaleDateString() : 'N/A'}</td>
        </tr>
    `).join('') : '<tr><td colspan="5">No payment history.</td></tr>';
}

function renderActionButtons(fine) {
    if (fine.status === 'UNPAID') {
        return `<button class="btn btn-primary" onclick="openPaymentModal(${fine.id}, ${fine.amount})">Submit Payment Proof</button>`;
    }
    if (fine.status === 'PENDING_VERIFICATION') {
        return `<button class="btn btn-outline" disabled>Pending</button>`;
    }
    return '';
}

function openPaymentModal(fineId, amount) {
    currentFineForModal = { id: fineId, amount: amount };
    document.getElementById('modal-fine-amount').textContent = `৳${amount.toFixed(2)}`;
    document.getElementById('payment-proof-modal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('payment-proof-modal').style.display = 'none';
    document.getElementById('payment-proof-form').reset();
    currentFineForModal = null;
}

async function handleProofSubmission(event) {
    event.preventDefault();
    if (!currentFineForModal) return;

    const trxIdInput = document.getElementById('trxIdInput');
    const trXID = trxIdInput.value.trim();
    if (!trXID) {
        alert("Please enter a valid Transaction ID.");
        return;
    }

    try {
        await LibraryApiService.request(`/fines/${currentFineForModal.id}/submit-payment`, {
            method: 'POST',
            body: JSON.stringify({ trXID: trXID })
        });
        showNotification('Payment proof submitted successfully! Awaiting admin verification.', 'success');
        closePaymentModal();
        loadFinesData(); // Refresh the list
    } catch (error) {
        console.error("Failed to submit payment proof:", error);
        showNotification(error.message || 'Failed to submit proof. The TrxID might already be in use.', 'error');
    }
}

function formatStatus(status) {
    return (status || '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function escapeHtml(text) {
    if (text === null || typeof text === 'undefined') return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Ensure lucide icons are re-rendered if the table changes
const observer = new MutationObserver(() => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
const tables = document.querySelectorAll('.data-table tbody');
tables.forEach(table => observer.observe(table, { childList: true }));
