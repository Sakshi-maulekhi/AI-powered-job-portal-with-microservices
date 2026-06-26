# 🚀 AI-Powered Job Portal Backend

A scalable backend for an AI-powered Job Portal built using a **Microservices Architecture**. The project provides secure authentication, job management, user management, AI-powered resume analysis, career guidance, asynchronous communication with Apache Kafka, Redis caching, and payment integration.

---

## ✨ Features

### 🔐 Authentication
- JWT-based Authentication
- Secure Password Hashing using bcrypt
- User Registration & Login
- Forgot Password & Reset Password
- Role-based Authorization (Candidate & Recruiter)

### 👤 User Management
- Candidate & Recruiter Profiles
- Resume Upload
- Skills Management
- Profile Updates

### 💼 Job Management
- Create, Update & Delete Jobs
- Browse Available Jobs
- Apply for Jobs
- Company Management

### 🤖 AI Features
- AI Resume Analyzer
- AI Career Guidance
- Resume Processing

### 💳 Payment
- Razorpay Subscription Integration
- Payment Verification

### 📧 Notifications
- Email Verification
- Welcome Emails
- Password Reset Emails
- Kafka-based Email Queue

---

# 🏗️ Architecture

The backend follows a **Microservices Architecture**, where each service has a single responsibility and communicates asynchronously through Apache Kafka.

```
                API Requests
                      │
      ┌───────────────┼───────────────┐
      │               │               │
 Auth Service   User Service   Job Service
      │               │               │
      └───────────────┼───────────────┘
                      │
              Apache Kafka
                      │
              Utility Service
                 

        PostgreSQL        Redis
```

---

# 🛠️ Tech Stack

## Backend
- Node.js
- Express.js
- TypeScript

## Database
- PostgreSQL

## Cache
- Redis

## Message Broker
- Apache Kafka

## AI
- OpenAI API

## Authentication
- JWT
- bcrypt

## File Upload
- Multer
- Cloudinary

## Payments
- Razorpay

## Containerization
- Docker
- Docker Compose

---

# 🔧 Microservices

### 🔐 Auth Service
- User Registration
- Login
- JWT Authentication
- Password Reset

### 👤 User Service
- Profile Management
- Resume Upload
- Skills Management

### 💼 Job Service
- Job CRUD
- Company Management
- Job Applications

### 💳 Payment Service
- Subscription Handling
- Razorpay Integration

### 📨 Utility Service
- Kafka Consumer
- Email Notifications
- Password Reset Emails

---

# ⚡ Event-Driven Communication

Apache Kafka enables asynchronous communication between services.

Example Flow:

```
User Registers
      │
      ▼
Kafka Topic
      │
      ▼
Utility Service
      │
      ▼
Send Welcome Email
```

---

# 🗄️ Database

- PostgreSQL
- Relational Schema
- Foreign Key Relationships
- Optimized Queries

---

# 🔒 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Role-based Access Control
- Secure Password Reset Flow
- Environment Variable Management

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/your-username/ai-job-portal-backend.git
cd ai-job-portal-backend
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=
JWT_SECRET=
REDIS_URL=
KAFKA_BROKER=
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=
EMAIL_USER=
EMAIL_PASS=
RAZORPAY_KEY_ID=
RAZORPAY_SECRET=
OPENAI_API_KEY=
```

## Start with Docker

```bash
docker compose up --build
```

---

# 📌 Services

| Service | Port |
|----------|------|
| Auth Service | 5000 |
| Utility Service | 5001 |
| Payment Service | 5002 |
| User Service | 5003 |
| Job Service | 5004 |

---

# 📈 Future Enhancements

- AI Job Recommendation System
- AI Resume Builder
- Interview Scheduling
- Real-time Notifications
- Analytics Dashboard
- API Gateway
- Centralized Logging & Monitoring

---

