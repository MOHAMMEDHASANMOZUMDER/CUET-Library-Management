const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const userPassword = process.env.SEED_USER_PASSWORD || 'password123';

  const hashedAdmin = await bcrypt.hash(adminPassword, 10);
  const hashedUser = await bcrypt.hash(userPassword, 10);

  await prisma.admin.upsert({
    where: { email: 'admin@library.local' },
    update: {
      name: 'System Admin',
      department: 'Administration',
      superAdmin: true,
      enabled: true
    },
    create: {
      email: 'admin@library.local',
      name: 'System Admin',
      password: hashedAdmin,
      department: 'Administration',
      superAdmin: true,
      enabled: true
    }
  });

  console.log(`Seeded/ensured admin: admin@library.local / ${adminPassword}`);

  const users = [
    {
      email: 'student1@library.local',
      name: 'Student One',
      studentId: 'CUET-2020-0001',
      department: 'Computer Science',
      session: '2020-21'
    },
    {
      email: 'student2@library.local',
      name: 'Student Two',
      studentId: 'CUET-2020-0002',
      department: 'Electrical Engineering',
      session: '2020-21'
    }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        studentId: u.studentId,
        department: u.department,
        session: u.session,
        enabled: true
      },
      create: {
        email: u.email,
        name: u.name,
        studentId: u.studentId,
        department: u.department,
        session: u.session,
        password: hashedUser,
        role: 'STUDENT',
        enabled: true
      }
    });
  }

  console.log(`Seeded/ensured students: ${users.map((u) => u.email).join(', ')} / ${userPassword}`);

  const books = [
    {
      isbn: BigInt('9780131103627'),
      title: 'The C Programming Language',
      author: 'Kernighan & Ritchie',
      category: 'Programming',
      totalCopies: 3
    },
    {
      isbn: BigInt('9780132350884'),
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Software Engineering',
      totalCopies: 4
    },
    {
      isbn: BigInt('9780262033848'),
      title: 'Introduction to Algorithms',
      author: 'Cormen, Leiserson, Rivest, Stein',
      category: 'Algorithms',
      totalCopies: 2
    },
    {
      isbn: BigInt('9780134494166'),
      title: 'Computer Networking: A Top-Down Approach',
      author: 'Kurose & Ross',
      category: 'Networking',
      totalCopies: 2
    },
    {
      isbn: BigInt('9780134685991'),
      title: 'Effective Java',
      author: 'Joshua Bloch',
      category: 'Programming',
      totalCopies: 3
    }
  ];

  for (const b of books) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {
        title: b.title,
        author: b.author,
        category: b.category,
        totalCopies: b.totalCopies,
        availableCopies: b.totalCopies
      },
      create: {
        isbn: b.isbn,
        title: b.title,
        author: b.author,
        category: b.category,
        totalCopies: b.totalCopies,
        availableCopies: b.totalCopies
      }
    });

    for (let i = 1; i <= b.totalCopies; i += 1) {
      const copyId = `${b.isbn.toString()}-${i}`;
      await prisma.bookCopy.upsert({
        where: { copyId },
        update: {
          isbn: b.isbn,
          status: 'AVAILABLE',
          location: 'Main Library'
        },
        create: {
          copyId,
          isbn: b.isbn,
          status: 'AVAILABLE',
          location: 'Main Library'
        }
      });
    }
  }

  console.log(`Seeded/ensured books: ${books.length} and copies.`);

  // Optional extra demo data for UI testing; only insert if tables are empty.
  const borrowCount = await prisma.borrowRecord.count();
  const preBookCount = await prisma.preBook.count();
  if (borrowCount === 0 && preBookCount === 0) {
    const student = await prisma.user.findUnique({ where: { email: 'student1@library.local' } });
    const firstBook = await prisma.book.findUnique({ where: { isbn: books[0].isbn } });
    const firstCopy = await prisma.bookCopy.findUnique({ where: { copyId: `${books[0].isbn.toString()}-1` } });

    if (student && firstBook && firstCopy) {
      const prebook = await prisma.preBook.create({
        data: {
          userId: student.id,
          bookId: firstBook.id,
          status: 'APPROVED'
        }
      });

      const due = new Date();
      due.setDate(due.getDate() + 7);

      const borrow = await prisma.borrowRecord.create({
        data: {
          userId: student.id,
          bookId: firstBook.id,
          copyId: firstCopy.copyId,
          preBookId: prebook.id,
          dueDate: due
        }
      });

      await prisma.fine.create({
        data: {
          userId: student.id,
          borrowRecordId: borrow.id,
          amount: 25.0,
          status: 'UNPAID'
        }
      });

      await prisma.note.create({
        data: {
          userId: student.id,
          bookId: firstBook.id,
          title: 'Sample Note',
          subject: 'Demo',
          status: 'APPROVED'
        }
      });

      console.log('Seeded demo prebook/borrow/fine/note for student1.');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
