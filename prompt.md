# Digital Facility Task Management (DFTM) System - Project Prompt

## Overview
Create a full-stack application for managing facility maintenance tasks with real-time email integration, multi-language support, and advanced task management features.

## Core Requirements

### Backend (Java Spring Boot)

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (USER, ADMIN, SUPERADMIN)
   - Secure password handling with encryption
   - Session management with last login tracking

2. **Task Management**
   - CRUD operations for tasks
   - Status tracking (pending, in_progress, completed, cannot_fix)
   - Task assignment and reassignment
   - Task comments and history
   - File attachments with size limits and type validation
   - Due date management
   - Priority levels

3. **Email Integration**
   - IMAP email listener for automatic task creation
   - Email notification system
   - Attachment handling from emails
   - HTML email template support

4. **Multi-language Support**
   - Automatic translation of task content
   - Support for Swedish (default), English, Polish, and Ukrainian
   - Translation priority queue
   - Batch translation capabilities

5. **Data Security**
   - Encrypted sensitive data storage
   - Secure file handling
   - API rate limiting
   - Input validation and sanitization

### Frontend (React)

1. **User Interface**
   - Modern, responsive design
   - Dark/light theme support
   - Accessibility compliance
   - Mobile-first approach

2. **Task Management Interface**
   - Task list with filtering and sorting
   - Task detail view
   - Comment system
   - File upload/download
   - Status management
   - Assignment handling

3. **Admin Features**
   - User management
   - Task statistics and reports
   - System settings
   - Translation management
   - Email template management

4. **Internationalization**
   - Language switcher
   - RTL support
   - Localized date/time formats
   - Translation status indicators

## Technical Specifications

### Backend
- Java 17+
- Spring Boot 3.x
- MongoDB
- JWT Authentication
- Spring Security
- JavaMail API
- Google Translate API
- File handling with validation
- Lombok for boilerplate reduction
- Scheduled tasks support

### Frontend
- React 18+
- Redux Toolkit for state management
- React Router 6+
- i18next for translations
- Tailwind CSS for styling
- React Query for API calls
- JWT handling
- File upload/download
- Toast notifications
- Form validation

## Database Schema

### User Collection
- ID
- Name
- Email
- Password (encrypted)
- Role
- Preferred Language
- Last Login
- Active Status
- Created At
- Updated At

### Task Collection
- ID
- Title
- Description
- Status
- Priority
- Reporter Info
- Assigned To
- Created At
- Updated At
- Due Date
- Comments
- Attachments
- Translations
- Metadata

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh-token

### Tasks
- GET /api/tasks
- POST /api/tasks
- GET /api/tasks/{id}
- PUT /api/tasks/{id}
- DELETE /api/tasks/{id}
- PATCH /api/tasks/{id}/status
- POST /api/tasks/{id}/comments
- POST /api/tasks/{id}/attachments

### Users
- GET /api/users
- POST /api/users
- GET /api/users/{id}
- PUT /api/users/{id}
- DELETE /api/users/{id}

### Translation
- POST /api/translate
- POST /api/translate/batch
- GET /api/translate/status

## Additional Features

1. **Performance Optimization**
   - Caching strategy
   - Lazy loading
   - Image optimization
   - Bundle optimization

2. **Monitoring & Logging**
   - Error tracking
   - Performance monitoring
   - User activity logging
   - System health checks

3. **Security Measures**
   - CSRF protection
   - XSS prevention
   - SQL injection prevention
   - Rate limiting

4. **Development Tools**
   - Swagger/OpenAPI documentation
   - Development environment setup
   - Testing framework
   - CI/CD pipeline

## Deployment Requirements

1. **Environment Variables**
   - Database credentials
   - JWT secret
   - Email configuration
   - API keys
   - Environment-specific settings

2. **Build & Deploy**
   - Maven build configuration
   - Docker support
   - Production optimization
   - Environment-specific configurations

## Testing Requirements

1. **Backend Testing**
   - Unit tests
   - Integration tests
   - API tests
   - Security tests

2. **Frontend Testing**
   - Component tests
   - Integration tests
   - E2E tests
   - Performance tests

## Documentation Requirements

1. **Technical Documentation**
   - API documentation
   - Database schema
   - Architecture overview
   - Security measures

2. **User Documentation**
   - User manual
   - Admin guide
   - API guide
   - Troubleshooting guide

## Maintenance & Support

1. **System Maintenance**
   - Regular updates
   - Security patches
   - Performance optimization
   - Bug fixes

2. **User Support**
   - Issue tracking
   - User feedback
   - Feature requests
   - Bug reporting

This prompt provides a comprehensive overview of the DFTM system requirements, ensuring all necessary components and features are properly implemented while maintaining high standards for security, performance, and user experience. 