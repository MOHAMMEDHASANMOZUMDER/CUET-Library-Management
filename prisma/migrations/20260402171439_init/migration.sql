-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookCopyStatus" AS ENUM ('AVAILABLE', 'BORROWED', 'RESERVED', 'LOST', 'DAMAGED', 'UNDER_REPAIR', 'RETIRED');

-- CreateEnum
CREATE TYPE "PreBookStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FineStatus" AS ENUM ('UNPAID', 'PENDING_VERIFICATION', 'PAID');

-- CreateEnum
CREATE TYPE "NoteStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "studentId" TEXT,
    "department" TEXT,
    "session" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "superAdmin" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "isbn" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT,
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookCopy" (
    "copyId" TEXT NOT NULL,
    "isbn" BIGINT NOT NULL,
    "status" "BookCopyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT,

    CONSTRAINT "BookCopy_pkey" PRIMARY KEY ("copyId")
);

-- CreateTable
CREATE TABLE "PreBook" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PreBookStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "PreBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BorrowRecord" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "copyId" TEXT NOT NULL,
    "preBookId" INTEGER,
    "borrowDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "extendedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BorrowRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fine" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "borrowRecordId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "FineStatus" NOT NULL DEFAULT 'UNPAID',
    "trxId" TEXT,
    "paymentSubmissionDate" TIMESTAMP(3),
    "paymentApprovalDate" TIMESTAMP(3),

    CONSTRAINT "Fine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER,
    "title" TEXT NOT NULL,
    "subject" TEXT,
    "fileName" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "fileData" BYTEA,
    "status" "NoteStatus" NOT NULL DEFAULT 'PENDING',
    "uploadTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_studentId_key" ON "User"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE INDEX "Book_title_idx" ON "Book"("title");

-- CreateIndex
CREATE INDEX "Book_author_idx" ON "Book"("author");

-- CreateIndex
CREATE INDEX "Book_category_idx" ON "Book"("category");

-- CreateIndex
CREATE INDEX "BookCopy_isbn_idx" ON "BookCopy"("isbn");

-- CreateIndex
CREATE INDEX "BookCopy_status_idx" ON "BookCopy"("status");

-- CreateIndex
CREATE INDEX "PreBook_userId_idx" ON "PreBook"("userId");

-- CreateIndex
CREATE INDEX "PreBook_bookId_idx" ON "PreBook"("bookId");

-- CreateIndex
CREATE INDEX "PreBook_status_idx" ON "PreBook"("status");

-- CreateIndex
CREATE INDEX "BorrowRecord_userId_idx" ON "BorrowRecord"("userId");

-- CreateIndex
CREATE INDEX "BorrowRecord_bookId_idx" ON "BorrowRecord"("bookId");

-- CreateIndex
CREATE INDEX "BorrowRecord_copyId_idx" ON "BorrowRecord"("copyId");

-- CreateIndex
CREATE INDEX "BorrowRecord_preBookId_idx" ON "BorrowRecord"("preBookId");

-- CreateIndex
CREATE UNIQUE INDEX "Fine_borrowRecordId_key" ON "Fine"("borrowRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "Fine_trxId_key" ON "Fine"("trxId");

-- CreateIndex
CREATE INDEX "Fine_userId_idx" ON "Fine"("userId");

-- CreateIndex
CREATE INDEX "Fine_status_idx" ON "Fine"("status");

-- CreateIndex
CREATE INDEX "Note_userId_idx" ON "Note"("userId");

-- CreateIndex
CREATE INDEX "Note_bookId_idx" ON "Note"("bookId");

-- CreateIndex
CREATE INDEX "Note_status_idx" ON "Note"("status");

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_isbn_fkey" FOREIGN KEY ("isbn") REFERENCES "Book"("isbn") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreBook" ADD CONSTRAINT "PreBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreBook" ADD CONSTRAINT "PreBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowRecord" ADD CONSTRAINT "BorrowRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowRecord" ADD CONSTRAINT "BorrowRecord_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowRecord" ADD CONSTRAINT "BorrowRecord_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "BookCopy"("copyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowRecord" ADD CONSTRAINT "BorrowRecord_preBookId_fkey" FOREIGN KEY ("preBookId") REFERENCES "PreBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fine" ADD CONSTRAINT "Fine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fine" ADD CONSTRAINT "Fine_borrowRecordId_fkey" FOREIGN KEY ("borrowRecordId") REFERENCES "BorrowRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
