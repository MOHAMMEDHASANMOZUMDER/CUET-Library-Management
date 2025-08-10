# CUET Library Management System

## Overview

The CUET Library Management System is a comprehensive digital platform designed to automate and streamline library operations for Chittagong University of Engineering & Technology (CUET). The system provides functionality for both students and administrators to manage books, borrowing, fines, notes, and various library services through a modern web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a multi-page HTML architecture with vanilla JavaScript for interactivity. The frontend follows a modular approach with:
- **Static HTML Pages**: Individual pages for different functionalities (dashboard, books, admin, etc.)
- **CSS Styling**: Custom CSS with Bootstrap integration for responsive design
- **JavaScript Modules**: Separate JS files for each major feature (auth, books, dashboard, etc.)
- **Icon System**: Lucide icons for consistent visual elements

### Backend Architecture
The system is built with Java Spring Boot following MVC pattern:
- **Entity Layer**: JPA entities for User, Book, and other domain objects
- **Repository Layer**: Spring Data JPA repositories for database operations
- **Service Layer**: Business logic implementation with UserService, AuthService
- **Controller Layer**: REST API endpoints for frontend communication
- **Security Layer**: Custom UserPrincipal for authentication and authorization

### Authentication & Authorization
- **Role-based Access Control**: Separate interfaces for students and administrators
- **Session Management**: Token-based authentication with localStorage persistence
- **User Types**: Student and Admin roles with different permission levels
- **Security Integration**: Spring Security with custom UserPrincipal implementation

### Database Design
The system uses a relational database structure with:
- **User Management**: Student profiles with department affiliations
- **Book Catalog**: Comprehensive book information with availability tracking
- **Borrowing System**: Transaction records for book loans and returns
- **Fine Management**: Automated fine calculation and payment tracking
- **Notes System**: Student-generated study materials sharing

### Frontend State Management
- **Local Storage**: User session and preference persistence
- **Dynamic Content**: JavaScript-driven page updates without full reloads
- **Form Validation**: Client-side validation with server-side verification
- **Responsive Design**: Mobile-first approach with Bootstrap framework

## External Dependencies

### Frontend Libraries
- **Bootstrap 5.1.3**: UI framework for responsive design and components
- **Font Awesome 6.0.0**: Icon library for interface elements
- **Lucide Icons**: Additional icon set for modern UI elements

### Backend Dependencies
- **Spring Boot**: Main application framework
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database abstraction layer
- **Lombok**: Code generation for entity classes (currently missing from dependencies)
- **PostgreSQL**: Relational database (likely to be added)

### Build Tools
- **Maven**: Dependency management and build automation
- **Java**: Backend programming language

### Recent Updates (January 2025)
- **✅ Compilation Issues Resolved**: All Spring Boot compilation errors fixed successfully
- **✅ Database Setup**: Switched to H2 in-memory database for development with complete entity relationships
- **✅ Frontend Integration**: Added complete frontend with login, dashboard, books, notes, and fines pages
- **✅ Authentication System**: Implemented JWT-based authentication with role-based access control
- **✅ CSS Styling**: Applied CUET branding with green theme and responsive design
- **✅ JavaScript Functionality**: Added interactive features for all pages including search, navigation, and form handling
- **✅ Server Status**: Application successfully running on port 5000 with full functionality

### Database Configuration
Currently using H2 in-memory database for development. Can be easily switched to MySQL by updating application.properties:
- H2 (Current): `jdbc:h2:mem:cuet_library`
- MySQL (Available): `jdbc:mysql://localhost:3306/cuet_library`