// FAQ Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    const faqItems = document.querySelectorAll('.faq-item');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('faq-search');
    
    // Toggle FAQ answers
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
            
            if (isOpen) {
                answer.style.maxHeight = '0';
                answer.style.padding = '0 20px';
                question.querySelector('i').style.transform = 'rotate(0deg)';
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.padding = '20px';
                question.querySelector('i').style.transform = 'rotate(180deg)';
            }
        });
    });
    
    // Category filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.dataset.category;
            
            // Filter FAQ items
            faqItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // If searching, show all categories
            if (searchTerm) {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                categoryButtons[0].classList.add('active'); // Activate "All Questions"
            }
        });
    }
    
    // Initialize all FAQ items as closed
    faqItems.forEach(item => {
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = '0';
        answer.style.padding = '0 20px';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
    });
});
