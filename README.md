# 🏨 Hotel Booking System

A complete Hotel Booking Management System built with **Spring Boot** (Backend) and **React + Vite** (Frontend). This system allows users to book rooms, make payments, manage bookings, and handle refunds with role-based access control.



## ✨ Features

### 👤 Guest Features
- 🔍 View available rooms with images
- 📅 Book rooms with online payment (Razorpay)
- 💳 View booking history and invoices
- 🔄 Request refunds for bookings
- 📝 Pre-booking requests
- 📧 Contact support
- 👤 Profile management

### 🛎️ Receptionist Features
- ✅ Check-in guests
- 🚪 Check-out guests
- 📋 Manage all bookings
- 👤 Manage customers & drivers
- 💰 Manage refunds
- 📅 Manage pre-bookings
- 📊 Dashboard with today's schedule

### 👑 Admin Features
- 🏠 Full dashboard with statistics
- 🛏️ Room Management (CRUD)
- 👔 Employee Management (CRUD)
- 👤 Customer Management (CRUD)
- 🚗 Driver Management (CRUD)
- 📋 Manage all bookings
- ✅ Approve/Reject refunds
- 📅 Manage pre-bookings
- 📊 Reports & analytics
- 🏢 Department management
- 📧 Manage contact messages

---

## 🛠️ Tech Stack

### Backend
| Technology | Version |
|------------|---------|
| Java | 17 |
| Spring Boot | 3.2.3 |
| Spring Security | 3.2.3 |
| JWT | 0.11.5 |
| Hibernate/JPA | 6.4.4 |
| MySQL | 8.0 |
| Razorpay | 1.4.4 |
| Maven | 3.9+ |

### Frontend
| Technology | Version |
|------------|---------|
| React | 18.2.0 |
| Vite | 4.4.5 |
| Bootstrap | 5.3.0 |
| React Router DOM | 6.15.0 |
| Axios | 1.6.0 |
| React Hot Toast | 2.4.1 |
| React Icons | 4.11.0 |

---

## 📋 Default Login Credentials

### 👑 Admin Access (Full Control)
| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | ADMIN |

### 🛎️ Receptionist Access
| Username | Password | Role |
|----------|----------|------|
| `snehal` | `reception123` | RECEPTIONIST |
| `priya` | `reception123` | RECEPTIONIST |

### 👤 Guest Access
| Username | Password | Role |
|----------|----------|------|
| `Pragati` | `khot123` | GUEST |

---

## 📦 Installation & Setup

### Prerequisites
- Java 17+
- MySQL 8.0+
- Node.js 18+
- Maven 3.9+

### 1. Clone the Repository
```bash
git clone https://github.com/pragati-99/hotel-booking-system.git
cd hotel-booking-system
