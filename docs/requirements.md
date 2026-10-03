# Smart Study Planner - Requirements

## 1. Project Overview

Smart Study Planner is a full-stack web application designed to help
university students organize their academic workload, manage
assignments and deadlines, schedule study sessions and monitor
academic progress.

## 2. Problem Statement

University students often manage multiple subjects, assignments,
deadlines and study commitments at the same time. This can make it
difficult to organize their workload and allocate sufficient time
to important academic tasks.

Smart Study Planner provides a centralized platform for managing
these activities.

## 3. Target User

The primary target user is a university student who needs to organize
academic tasks and study time.

## 4. Main Features

### User Management
- User registration
- User login
- User logout
- Profile management

### Subject Management
- Add subjects
- View subjects
- Edit subjects
- Delete subjects

### Assignment Management
- Add assignments
- View assignments
- Edit assignments
- Delete assignments
- Set assignment priority
- Set assignment status
- Track assignment deadlines

### Study Session Management
- Create study sessions
- Edit study sessions
- Delete study sessions
- Mark sessions as completed
- Record study duration

### Calendar
- View assignments by date
- View study sessions by date

### Progress Tracking
- Track assignment completion
- Track study hours
- Display subject progress
- Display overall progress

### Dashboard
- Display total subjects
- Display total assignments
- Display upcoming deadlines
- Display study statistics
- Display recent activity

### Smart Study Recommendations
The system will analyse assignment deadlines, priority,
estimated workload and progress to generate suggested study sessions.

## 5. Main Pages

- Login
- Register
- Dashboard
- Subjects
- Assignments
- Study Planner
- Calendar
- Progress
- Profile

## 6. Technology Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Java
- Spring Boot

### Database
- MySQL

### Development Tools
- IntelliJ IDEA
- Git
- GitHub
- Postman

## 7. Main Database Entities

- User
- Subject
- Assignment
- Study Session

## 8. Relationships

One user can have many subjects.

One subject can have many assignments.

One subject can have many study sessions.

## 9. Non-Functional Requirements

### Usability
The application should have a simple and intuitive interface.

### Performance
Normal user operations should respond within a reasonable amount
of time.

### Security
User passwords and sensitive information should not be exposed.

### Maintainability
The application should use a structured architecture and
separation of responsibilities.

### Responsiveness
The interface should work on desktop, tablet and mobile screen sizes.

## 10. Project Scope

Version 1 focuses on individual student academic planning.

The system will not include lecturer or university administrator
accounts.

## 11. Future Improvements

Potential future features include:

- Notifications
- Email reminders
- Mobile application
- Calendar integration
- Advanced analytics
- AI-assisted study recommendations