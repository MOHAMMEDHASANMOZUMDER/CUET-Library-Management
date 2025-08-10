package com.cuet.library.service;

import com.cuet.library.entity.*;
import com.cuet.library.repository.BorrowRecordRepository;
import com.cuet.library.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BorrowService {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private BookService bookService;

    private static final int MAX_BOOKS_PER_USER = 5;
    private static final BigDecimal DAILY_FINE_RATE = new BigDecimal("5.00");

    public BorrowRecord borrowBook(User user, Book book) {
        // Check if user has reached borrowing limit
        long activeBorrows = borrowRecordRepository.countActiveBorrowsByUser(user);
        if (activeBorrows >= MAX_BOOKS_PER_USER) {
            throw new RuntimeException("Maximum borrowing limit reached");
        }

        // Check if book is available
        if (!book.isAvailable()) {
            throw new RuntimeException("Book is not available");
        }

        // Check if user has pending fines
        BigDecimal pendingFines = fineRepository.getTotalPendingFinesByUser(user);
        if (pendingFines != null && pendingFines.compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Please clear pending fines before borrowing");
        }

        // Create borrow record
        BorrowRecord borrowRecord = new BorrowRecord(user, book);
        borrowRecord = borrowRecordRepository.save(borrowRecord);

        // Update book availability
        bookService.borrowBook(book.getId());

        return borrowRecord;
    }

    public BorrowRecord returnBook(Long borrowRecordId) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowRecordId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (borrowRecord.getStatus() != BorrowRecord.Status.BORROWED) {
            throw new RuntimeException("Book is not currently borrowed");
        }

        borrowRecord.setReturnDate(LocalDate.now());
        borrowRecord.setStatus(BorrowRecord.Status.RETURNED);

        // Update book availability
        bookService.returnBook(borrowRecord.getBook().getId());

        return borrowRecordRepository.save(borrowRecord);
    }

    public BorrowRecord renewBook(Long borrowRecordId) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowRecordId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (!borrowRecord.canRenew()) {
            throw new RuntimeException("Book cannot be renewed");
        }

        borrowRecord.renew();
        return borrowRecordRepository.save(borrowRecord);
    }

    public List<BorrowRecord> getUserBorrowHistory(User user) {
        return borrowRecordRepository.findByUser(user);
    }

    public List<BorrowRecord> getActiveBorrows(User user) {
        return borrowRecordRepository.findByUserAndStatus(user, BorrowRecord.Status.BORROWED);
    }

    public List<BorrowRecord> getOverdueRecords() {
        return borrowRecordRepository.findOverdueRecords(LocalDate.now());
    }

    public Optional<BorrowRecord> findById(Long id) {
        return borrowRecordRepository.findById(id);
    }

    public long getActiveBorrowCount() {
        return borrowRecordRepository.countActiveBorrows();
    }

    @Scheduled(cron = "0 0 1 * * ?") // Run daily at 1 AM
    public void processOverdueFines() {
        List<BorrowRecord> overdueRecords = getOverdueRecords();
        
        for (BorrowRecord record : overdueRecords) {
            if (record.getStatus() == BorrowRecord.Status.BORROWED) {
                record.setStatus(BorrowRecord.Status.OVERDUE);
                borrowRecordRepository.save(record);

                // Create or update fine
                createOrUpdateFine(record);
            }
        }
    }

    private void createOrUpdateFine(BorrowRecord borrowRecord) {
        List<Fine> existingFines = fineRepository.findByUserAndStatus(
            borrowRecord.getUser(), Fine.Status.PENDING);
        
        Fine existingFine = existingFines.stream()
            .filter(f -> f.getBorrowRecord().getId().equals(borrowRecord.getId()))
            .findFirst()
            .orElse(null);

        long daysOverdue = borrowRecord.getDaysOverdue();
        BigDecimal fineAmount = DAILY_FINE_RATE.multiply(new BigDecimal(daysOverdue));

        if (existingFine != null) {
            existingFine.setAmount(fineAmount);
            fineRepository.save(existingFine);
        } else {
            Fine fine = new Fine(borrowRecord.getUser(), borrowRecord, fineAmount, Fine.Type.OVERDUE);
            fine.setDescription("Overdue fine for " + borrowRecord.getBook().getTitle());
            fineRepository.save(fine);
        }
    }
}
