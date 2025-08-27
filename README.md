# EZStay Frontend

> Mod# EZStay Frontend

This is the frontend for the EZStay project, a modern web application for a room booking platform. It is built with Next.js and provides a user-friendly interface for guests, staff, and administrators.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Key Features

- **User Authentication**: Secure registration, login, and logout functionality.
- **OTP Email Verification**: New user registrations require email verification via a one-time password (OTP) sent to their email address. The user account is only created in the database *after* successful verification.
- **Role-Based Access Control (RBAC)**:
  - The application supports three user roles: `Admin`, `Staff`, and `User`.
  - Frontend routes are protected based on user roles (e.g., `/admin` is only accessible to `Admin` users).
  - A "Not Authorized" page is shown to users trying to access restricted areas.
- **JWT Token Management**: User sessions are managed using JSON Web Tokens (JWT), which are stored in `localStorage`.
- **Admin Dashboard**:
  - A dedicated section for administrators.
  - Feature to create new `Staff` accounts.
- **Modern UI**: A clean and responsive user interface.

## Environment Variables

To run this project, you will need to create a `.env.local` file in the root of the `ezstay-fe-project` directory.

> **Important Note:** The `.env.local` file is included in the project's `.gitignore` file. This means it will **not** be pushed to the GitHub repository. Each developer must create their own local copy of this file.

Create the file `ezstay-fe-project/.env.local` and add the following content:

```env
# This should be the URL of your Ocelot API Gateway
NEXT_PUBLIC_API_URL=http://localhost:7001
```

This variable is used to tell the Next.js application where to send API requests.

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn

### Installation

1.  Navigate to the frontend project directory:
    ```bash
    cd frontend/my-next-app/ezstay-fe-project
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create the `.env.local` file as described in the "Environment Variables" section above.

### Running the Development Server

1.  Start the development server:
    ```bash
    npm run dev
    ```
2.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Default Admin Credentials

You can log in as an administrator using the default credentials seeded in the backend:
- **Email**: `admin@gmail.com`
- **Password**: `admin123`
rn Room Rental Platform with MongoDB & ASP.NET Microservices Backend

## 🛠️ Getting Started

You must download NodeJS in Google First.

Open Terminal in Project

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## � Page Routes for Testing

### Public Pages

- **Home**: [http://localhost:3000](http://localhost:3000)
- **Login**: [http://localhost:3000/login](http://localhost:3000/login)
- **Register**: [http://localhost:3000/register](http://localhost:3000/register)
- **Search Rooms**: [http://localhost:3000/search](http://localhost:3000/search)
- **Room Details**: [http://localhost:3000/rooms/[id]](http://localhost:3000/rooms/1)
- **Support**: [http://localhost:3000/support](http://localhost:3000/support)

### User Dashboard

- **Dashboard Home**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Profile**: [http://localhost:3000/dashboard/profile](http://localhost:3000/dashboard/profile)
- **Favorites**: [http://localhost:3000/dashboard/favorites](http://localhost:3000/dashboard/favorites)
- **Rental Requests**: [http://localhost:3000/dashboard/requests](http://localhost:3000/dashboard/requests)
- **Rental History**: [http://localhost:3000/dashboard/history](http://localhost:3000/dashboard/history)
- **Bills & Payments**: [http://localhost:3000/dashboard/bills](http://localhost:3000/dashboard/bills)
- **Reviews**: [http://localhost:3000/dashboard/reviews](http://localhost:3000/dashboard/reviews)
- **Notifications**: [http://localhost:3000/dashboard/notifications](http://localhost:3000/dashboard/notifications)

### Owner Dashboard

- **Owner Home**: [http://localhost:3000/owner](http://localhost:3000/owner)
- **Properties**: [http://localhost:3000/owner/properties](http://localhost:3000/owner/properties)
- **Rooms**: [http://localhost:3000/owner/rooms](http://localhost:3000/owner/rooms)
- **Posts**: [http://localhost:3000/owner/posts](http://localhost:3000/owner/posts)
- **Tenants**: [http://localhost:3000/owner/tenants](http://localhost:3000/owner/tenants)
- **Contracts**: [http://localhost:3000/owner/contracts](http://localhost:3000/owner/contracts)
- **Bills**: [http://localhost:3000/owner/bills](http://localhost:3000/owner/bills)
- **Requests**: [http://localhost:3000/owner/requests](http://localhost:3000/owner/requests)
- **Reviews**: [http://localhost:3000/owner/reviews](http://localhost:3000/owner/reviews)
- **Analytics**: [http://localhost:3000/owner/analytics](http://localhost:3000/owner/analytics)
- **Notifications**: [http://localhost:3000/owner/notifications](http://localhost:3000/owner/notifications)

### Staff Dashboard

- **Staff Home**: [http://localhost:3000/staff](http://localhost:3000/staff)
- **User Management**: [http://localhost:3000/staff/users](http://localhost:3000/staff/users)
- **Post Moderation**: [http://localhost:3000/staff/moderation](http://localhost:3000/staff/moderation)
- **Posts**: [http://localhost:3000/staff/posts](http://localhost:3000/staff/posts)
- **Reports**: [http://localhost:3000/staff/reports](http://localhost:3000/staff/reports)
- **Support**: [http://localhost:3000/staff/support](http://localhost:3000/staff/support)

### Admin Dashboard

- **Admin Home**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **System Overview**: [http://localhost:3000/admin/overview](http://localhost:3000/admin/overview)
- **User Management**: [http://localhost:3000/admin/users](http://localhost:3000/admin/users)
- **Payment Gateways**: [http://localhost:3000/admin/payment-gateways](http://localhost:3000/admin/payment-gateways)
- **Financial Reports**: [http://localhost:3000/admin/financial-reports](http://localhost:3000/admin/financial-reports)
- **Notifications**: [http://localhost:3000/admin/notifications](http://localhost:3000/admin/notifications)

---

## 🔗 Backend Configuration (ASP.NET Microservices)

- **Database**: MongoDB
- **Architecture**: Microservices
- **Framework**: ASP.NET Core

Create file `.env.local`:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:7001
NODE_ENV=development
NEXT_PUBLIC_AMENITY_API_URL=https://localhost:7111
NEXT_PUBLIC_BOARDING_HOUSE_API_URL=https://localhost:7186
NEXT_PUBLIC_ROOM_API_URL=https://localhost:7086
NEXT_PUBLIC_HOUSE_LOCATION_API_URL=https://localhost:7278
NEXT_PUBLIC_ROOM_AMENITY_API_URL=https://localhost:7152
NEXT_PUBLIC_MOCK_OWNER_ID=123e4567-e89b-12d3-a456-426614174000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Create file `.env.example`:

```env
# EZStay Frontend Environment Configuration
# Copy this file to .env.local and update the values for your environment

# Main API Gateway URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Microservice URLs for ASP.NET Core Backend
NEXT_PUBLIC_AUTH_API=http://localhost:5001
NEXT_PUBLIC_PROPERTY_API=http://localhost:5002
NEXT_PUBLIC_PAYMENT_API=http://localhost:5003
NEXT_PUBLIC_NOTIFICATION_API=http://localhost:5004

# MongoDB Connection (for reference - used by backend)
# MONGODB_CONNECTION_STRING=mongodb://localhost:27017/ezstay

# JWT Secret (for reference - used by backend)
# JWT_SECRET=your_jwt_secret_key_here

# Payment Gateway Configuration (for reference - used by backend)
# STRIPE_PUBLIC_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...

# Email Service Configuration (for reference - used by backend)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password

# File Upload Configuration (for reference - used by backend)
# UPLOAD_MAX_SIZE=10485760
# UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf

# Redis Configuration (for reference - used by backend)
# REDIS_CONNECTION_STRING=localhost:6379

# Application Configuration
NEXT_PUBLIC_APP_NAME=EZStay
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_SUPPORT_EMAIL=support@ezstay.com
NEXT_PUBLIC_SUPPORT_PHONE=+84898552368

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_ASSISTANT=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# External Service URLs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Development/Testing Flags
NEXT_PUBLIC_MOCK_API=false
NEXT_PUBLIC_DEBUG_MODE=false

```

- All API calls will use these URLs. If not set, the app will use mock data for development.
- Make sure your backend enables CORS for the frontend domain.

---

## 🌟 Features

- ✅ User Authentication & Authorization
- ✅ Room Search & Filtering
- ✅ Property Management for Owners
- ✅ Post Room Feature
- ✅ Rental Request System
- ✅ Payment & Billing System
- ✅ Review & Rating System
- ✅ Real-time Notifications
- ✅ AI Assistant Chatbot
- ✅ Dark/Light Theme Toggle
- ✅ Responsive Design
- ✅ Admin & Staff Management
- ✅ Multi-language Support (English)

---

> EZStay - Modern Room Rental Platform
