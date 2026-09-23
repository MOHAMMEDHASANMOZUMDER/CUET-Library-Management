# 📚 CUET Library Management System

> A full-stack library management platform designed to digitize and streamline book management, borrowing, user authentication, and library operations for CUET.

**Live Demo:** [cuet-library-management.vercel.app](https://cuet-library-management.vercel.app/)
**Repository:** [GitHub](https://github.com/MOHAMMEDHASANMOZUMDER/CUET-Library-Management)

---

## 📌 Overview

The **CUET Library Management System** is a full-stack web application developed to provide a centralized platform for managing library resources and user activities.

The system is designed around a database-driven architecture where library information, users, books, borrowing records, and related operations can be managed through a web interface.

The project was developed as an academic full-stack application while focusing on practical backend development, relational database design, authentication, API development, and deployment.

---

## ✨ Features

### 👤 User Management

* User registration and authentication
* Secure password hashing
* JWT-based authentication
* User-specific library operations
* Role-oriented backend architecture

### 📚 Book Management

* Add and manage library books
* Store structured book information
* Track book availability
* Retrieve book records through backend APIs
* Database-backed library catalog

### 🔄 Library Operations

* Book borrowing workflow
* Book return management
* Borrowing record management
* Library activity tracking
* Availability management

### 📊 Database Management

* Relational PostgreSQL database
* Prisma ORM
* Structured database schema
* Database migrations
* Seed data support

### 📧 Communication

* Email functionality through Nodemailer
* Backend support for application notifications and communication

### 📁 File Handling

* Backend file-upload support using Multer
* Server-side processing of uploaded resources

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │        User          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Web Frontend     │
                         │                      │
                         │   User Interface     │
                         │   Library Pages      │
                         │   Authentication     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Express.js       │
                         │      Backend         │
                         │                      │
                         │  REST API / Routes   │
                         │  Authentication      │
                         │  File Uploads        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │        Prisma        │
                         │         ORM          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      PostgreSQL      │
                         │       Database       │
                         └──────────────────────┘

                         ┌──────────────────────┐
                         │     Nodemailer      │
                         │   Email Services    │
                         └──────────────────────┘
```

---

## 🛠️ Tech Stack

| Technology     | Purpose                               |
| -------------- | ------------------------------------- |
| **Node.js**    | Backend runtime                       |
| **Express.js** | REST API and server                   |
| **PostgreSQL** | Relational database                   |
| **Prisma ORM** | Database access and schema management |
| **JavaScript** | Application development               |
| **JWT**        | Authentication                        |
| **bcryptjs**   | Password hashing                      |
| **Multer**     | File uploads                          |
| **Nodemailer** | Email functionality                   |
| **Docker**     | Containerization support              |
| **Vercel**     | Deployment                            |

The repository's `package.json` confirms Express, Prisma 6, PostgreSQL through Prisma, JWT, bcryptjs, Multer, Nodemailer, and dotenv are part of the project stack.

---

## 🗄️ Database

The application uses **PostgreSQL** with **Prisma ORM**.

Prisma is responsible for:

* Database schema management
* Type-safe database queries
* Database migrations
* Database seeding
* CRUD operations

The repository includes dedicated Prisma scripts for generating the client, creating migrations, deploying migrations, and seeding the database.

### Database workflow

```text
Application
     │
     ▼
Express API
     │
     ▼
Prisma Client
     │
     ▼
PostgreSQL
```

---

## 🔐 Authentication & Security

The backend includes authentication-related functionality using:

* **JWT** for authentication tokens
* **bcryptjs** for password hashing
* Environment variables for sensitive configuration
* Server-side authentication logic

Sensitive information should always be stored through environment variables rather than committed to the repository.

---

## 📂 Project Structure

```text
CUET-Library-Management/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   └── server.js
│
├── .local/
│
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

The repository currently contains the `prisma` and `src` directories along with Docker configuration, environment-variable examples, and Prisma configuration.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* Node.js 18+
* npm
* PostgreSQL
* Git

The project specifies Node.js `>=18` in its package configuration.

### 1. Clone the repository

```bash
git clone https://github.com/MOHAMMEDHASANMOZUMDER/CUET-Library-Management.git
```

### 2. Navigate to the project

```bash
cd CUET-Library-Management
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file based on `.env.example`.

Example:

```env
DATABASE_URL="your_postgresql_connection_string"

JWT_SECRET="your_jwt_secret"

PORT=5000
```

Use the exact variables required by the current application configuration.

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. Apply database migrations

For development:

```bash
npm run prisma:migrate
```

For an existing production database:

```bash
npm run prisma:deploy
```

### 7. Seed the database

```bash
npm run prisma:seed
```

### 8. Start the application

```bash
npm run dev
```

The project also provides a regular `npm start` script for starting the Node.js server.

---

## 🐳 Docker

The repository includes:

* `Dockerfile`
* `docker-compose.yml`

This allows the application to be containerized and run in a more consistent development or deployment environment.

---

## 🔮 Future Improvements

Possible extensions for the platform include:

* [ ] Online book reservation
* [ ] Book renewal system
* [ ] Fine calculation and payment integration
* [ ] bKash / Nagad / Rocket payment support
* [ ] Digital library / PDF resources
* [ ] Advanced book search and filtering
* [ ] Personalized book recommendations
* [ ] Real-time notifications
* [ ] Admin analytics dashboard
* [ ] Library activity reports
* [ ] Email notifications for due dates
* [ ] Online reading/resource management
* [ ] Improved role-based access control

---

## 🎯 Learning Outcomes

This project provided practical experience with:

* Full-stack web development
* REST API development
* Express.js backend architecture
* PostgreSQL database design
* Prisma ORM
* Database migrations
* Authentication and authorization
* Password security
* JWT
* File uploads
* Email services
* Docker
* Environment configuration
* Deployment

---

## 🌐 Live Application

**CUET Library Management System**

[Open Live Application](https://cuet-library-management.vercel.app/)

---

## 👨‍💻 Author

### Md. Hasan

**CSE Undergraduate at Chittagong University of Engineering & Technology (CUET)**
**Full-Stack Web Developer**

* GitHub: [MOHAMMEDHASANMOZUMDER](https://github.com/MOHAMMEDHASANMOZUMDER)
* Portfolio: [my-portfolio-fb37.vercel.app](https://my-portfolio-fb37.vercel.app/)

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project was developed for educational and portfolio purposes.
