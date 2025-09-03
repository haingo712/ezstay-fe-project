# EZStay Frontend

> Mod# EZStay Frontend

This is the frontend for the EZStay project, a modern web application for a room booking platform. It is built with Next.js and provides a user-friendly interface for guests, staff, and administrators.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

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
NEXT_PUBLIC_API_GATEWAY_URL=https://localhost:7000
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Create file `.env.example`:

```env
# Main API Gateway URL
NEXT_PUBLIC_API_GATEWAY_URL=https://localhost:7000

# Mock Data for Development
NEXT_PUBLIC_MOCK_OWNER_ID=123e4567-e89b-12d3-a456-426614174000

# Development Environment
NODE_ENV=development


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
