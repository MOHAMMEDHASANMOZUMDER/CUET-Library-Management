
let paymentAmount = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    const userType = localStorage.getItem('userType');
    if (!userType) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load fines data
    loadFinesData();
    
    // Initialize payment amount input listener
    const paymentInput = document.getElementById('payment-amount');
    if (paymentInput) {
        paymentInput.addEventListener('input', updatePaymentSummary);
    }
    
    // Initialize payment method listener
    const paymentMethodSelect = document.getElementById('payment-method');
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', updatePaymentSummary);
    }
});

function loadFinesData() {
    loadOutstandingFines();
    loadPaymentHistory();
    updateSummaryCards();
}

function updateSummaryCards() {
    // Mock summary data
    document.getElementById('total-outstanding').textContent = '৳150';
    document.getElementById('overdue-fines').textContent = '৳100';
    document.getElementById('paid-this-month').textContent = '৳75';
}

function loadOutstandingFines() {
    // Mock outstanding fines data
    const outstandingFines = [
        {
            id: 1,
            bookTitle: 'Computer Networks',
            bookAuthor: 'Andrew S. Tanenbaum',
            bookImage: 'images/net.jpg',
            borrowDate: '2024-12-20',
            dueDate: '2025-01-03',
            returnDate: null,
            daysOverdue: 12,
            finePerDay: 5,
            totalFine: 60,
            fineType: 'overdue',
            canPay: true
        },
        {
            id: 2,
            bookTitle: 'Database Management Systems',
            bookAuthor: 'Raghu Ramakrishnan',
            bookImage: 'images/dbms.jpg',
            borrowDate: '2025-01-05',
            dueDate: '2025-01-19',
            returnDate: null,
            daysOverdue: 0,
            finePerDay: 0,
            totalFine: 15,
            fineType: 'overdue',
            description: 'Late renewal',
            canPay: true
        },
        {
            id: 3,
            bookTitle: 'Software Engineering (Damaged)',
            bookAuthor: 'Ian Sommerville',
            bookImage: 'images/se.jpg',
            borrowDate: '2024-11-15',
            dueDate: '2024-12-15',
            returnDate: '2024-12-16',
            daysOverdue: 0,
            finePerDay: 0,
            totalFine: 75,
            fineType: 'overdue',
            description: 'Late renewal',
            canPay: true
        }
    ];
    
    renderOutstandingFines(outstandingFines);
}

function renderOutstandingFines(fines) {
    const container = document.getElementById('outstanding-fines');
    if (!container) return;
    
    if (fines.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="check-circle"></i>
                <h3>No Outstanding Fines</h3>
                <p>You're all caught up! No fines to pay.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = fines.map(fine => `
        <div class="fine-item ${fine.fineType}">
            <div class="fine-book">
                <img src="${fine.bookImage}" alt="${fine.bookTitle}">
                <div class="book-info">
                    <h4>${fine.bookTitle}</h4>
                    <p>by ${fine.bookAuthor}</p>
                    <p class="book-dates">
                        Borrowed: ${formatDate(fine.borrowDate)} | 
                        Due: ${formatDate(fine.dueDate)}
                        ${fine.returnDate ? `| Returned: ${formatDate(fine.returnDate)}` : ''}
                    </p>
                    ${fine.daysOverdue > 0 ? `<p class="overdue-info">${fine.daysOverdue} days overdue</p>` : ''}
                    ${fine.description ? `<p class="fine-description">${fine.description}</p>` : ''}
                </div>
            </div>
            <div class="fine-details">
                <div class="fine-amount">৳${fine.totalFine}</div>
                ${fine.daysOverdue > 0 ? `
                    <div class="fine-calculation">
                        ৳${fine.finePerDay}/day × ${fine.daysOverdue} days
                    </div>
                ` : ''}
                <div class="fine-dates">
                    <span>Type: ${getFineTypeLabel(fine.fineType)}</span>
                </div>
            </div>
            <div class="fine-actions">
                <button class="btn btn-primary btn-small" onclick="payFine(${fine.id}, ${fine.totalFine})">
                    <i data-lucide="credit-card"></i>
                    Pay ৳${fine.totalFine}
                </button>
                <button class="btn btn-outline btn-small" onclick="viewFineDetails(${fine.id})">
                    <i data-lucide="info"></i>
                    Details
                </button>
            </div>
        </div>
    `).join('');
    
    // Reinitialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function loadPaymentHistory() {
    // Mock payment history data
    const paymentHistory = [
        {
            id: 1,
            amount: 25,
            date: '2024-12-20',
            method: 'bKash',
            transactionId: 'BKA123456789',
            bookTitle: 'Operating System Concepts',
            status: 'completed'
        },
        {
            id: 2,
            amount: 50,
            date: '2024-11-15',
            method: 'Cash',
            transactionId: 'CASH001',
            bookTitle: 'Data Structures',
            status: 'completed'
        }
    ];
    
    renderPaymentHistory(paymentHistory);
}

function renderPaymentHistory(payments) {
    const container = document.getElementById('payment-history');
    if (!container) return;
    
    if (payments.length === 0) {
        container.innerHTML = `
            <div class="empty-state" >
                <i data-lucide="history"></i>
                <h3>No Payment History</h3>
                <p>Your payment history will appear here.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="payment-history-table" class="history-table" style="width: 100%; font-family: Arial, sans-serif; border-collapse: collapse;">
            <table style="width: 100%; border: 1px solid #78e28fff;">
                <thead>
                    <tr>
                        <th style="padding: 12px 15px; border: 0.5px solid #78e28fff;">Date</th>
                        <th style="padding: 12px 15px; border: 0.5px solid #78e28fff;">Book</th>
                        <th style="padding: 12px 15px; border: 0.5px solid #78e28fff;">Amount</th>
                        <th style="padding: 12px 15px; border: 0.5px solid #78e28fff;">Method</th>
                        <th style="padding: 12px 15px; border: 0.5px solid #78e28fff;">Transaction ID</th>
                        <th style="padding: 12px 15px; border: 0.5px solid #78e28fff;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.map(payment => `
                        <tr>
                            <td style="padding: 12px 15px; border: 0.5px solid #78e28fff;" >${formatDate(payment.date)}</td>
                            <td style="padding: 12px 15px; border: 0.5px solid #78e28fff;">${payment.bookTitle}</td>
                            <td style="padding: 12px 15px; border: 0.5px solid #78e28fff;">৳${payment.amount}</td>
                            <td style="padding: 12px 15px; border: 0.5px solid #78e28fff;">${payment.method}</td>
                            <td class="transaction-id" style="padding: 12px 15px; border: 0.5px solid #78e28fff;">${payment.transactionId}</td>
                            <td style="padding: 12px 15px; border: 0.5px solid #78e28fff;"><span class="status-badge ${payment.status}">${payment.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Payment functions
function payAll() {
    paymentAmount = 150; // Total outstanding amount
    document.getElementById('payment-amount').value = paymentAmount;
    updatePaymentSummary();
    document.getElementById('payment-modal').style.display = 'block';
}

function showCustomPayment() {
    paymentAmount = 0;
    document.getElementById('payment-amount').value = '';
    updatePaymentSummary();
    document.getElementById('payment-modal').style.display = 'block';
}
let currentFineId = null;
function payFine(fineId, amount) {
    currentFineId=fineId;
    paymentAmount = amount;
    document.getElementById('payment-amount').value = amount;
    updatePaymentSummary();
    document.getElementById('payment-modal').style.display = 'block';
}

function updatePaymentSummary() {
    const amountInput = document.getElementById('payment-amount');
    const paymentMethod = document.getElementById('payment-method').value;
    const amount = parseFloat(amountInput.value) || 0;
    
    // Calculate processing fee based on payment method
    let processingFee = 0;
    switch(paymentMethod) {
        case 'bkash':
        case 'nagad':
        case 'rocket':
            processingFee = Math.max(2, Math.round(amount * 0.015)); // 1.5% with minimum ৳2
            break;
        case 'card':
            processingFee = Math.max(3, Math.round(amount * 0.025)); // 2.5% with minimum ৳3
            break;
        case 'cash':
            processingFee = 0;
            break;
    }
    
    const total = amount + processingFee;
    
    document.getElementById('payment-summary-amount').textContent = `৳${amount}`;
    document.getElementById('processing-fee').textContent = `৳${processingFee}`;
    document.getElementById('payment-total').textContent = `৳${total}`;
}

function processPayment() {
    const amount = parseFloat(document.getElementById('payment-amount').value);
    const method = document.getElementById('payment-method').value;

    if (!amount || amount <= 0) {
        alert('Please enter a valid payment amount.');
        return;
    }

    if (amount > 150) {
        alert('Payment amount cannot exceed your total outstanding fine of ৳150.');
        return;
    }

    const tran_id = 'TXN' + Date.now(); // Generate transaction id

    if (method === 'bkash') {
        fetch('http://localhost:5000/api/initiate-sslcommerz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: amount,
                payment_method: method,
                fine_id: currentFineId,
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                customer_phone: '017XXXXXXXX',
                tran_id: tran_id
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'SUCCESS' && data.GatewayPageURL) {
                window.location.href = data.GatewayPageURL;
            } else {
                alert('Payment initialization failed. Please try again.');
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error connecting to payment gateway.');
        });
    } else {
        console.log('Processing payment:', { amount, method });
        alert(`Processing payment of ৳${amount} via ${method.toUpperCase()}...`);
        
        setTimeout(() => {
            alert('Payment successful! Your fine has been updated.');
            closePaymentModal();
            loadFinesData();
        }, 1000);
    }
}


function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
    document.getElementById('payment-amount').value = '';
    updatePaymentSummary();
}

function filterFines() {
    const filter = document.getElementById('fine-filter').value;
    console.log('Filtering fines by:', filter);
    // In a real implementation, this would filter the displayed fines
    loadOutstandingFines();
}

function viewFineDetails(fineId) {
    console.log('Viewing fine details for:', fineId);
    alert('Fine details will be displayed in a modal. This feature is coming soon!');
}

// Utility functions
function getFineTypeLabel(type) {
    switch(type) {
        case 'overdue': return 'Overdue';
        case 'damage': return 'Damage Fee';
        case 'renewal': return 'Renewal Fee';
        case 'lost': return 'Lost Book';
        default: return 'Other';
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Modal event listeners
window.addEventListener('click', function(e) {
    const paymentModal = document.getElementById('payment-modal');
    if (e.target === paymentModal) {
        closePaymentModal();
    }
});