# EZStay Deployment Configuration

## Production Deployment Checklist

### Frontend (Next.js)

- [ ] Update NEXT_PUBLIC_API_URL to production API gateway
- [ ] Configure all microservice URLs
- [ ] Set production Google Maps API key
- [ ] Configure Google Analytics
- [ ] Set NEXT_PUBLIC_MOCK_API=false
- [ ] Build production bundle: `npm run build`
- [ ] Test production build: `npm start`

### Backend Services (ASP.NET Core)

- [ ] Configure MongoDB connection string
- [ ] Set JWT secret keys
- [ ] Configure payment gateway credentials
- [ ] Set up SMTP email service
- [ ] Configure Redis for caching
- [ ] Set up file upload directories
- [ ] Configure CORS for frontend domain

### Database (MongoDB)

- [ ] Set up MongoDB Atlas or self-hosted instance
- [ ] Configure database indexes
- [ ] Set up backup strategy
- [ ] Configure connection pooling

### Infrastructure

- [ ] Set up reverse proxy (Nginx/IIS)
- [ ] Configure SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure auto-scaling if needed

## Service Ports (Development)

- Frontend: 3001
- API Gateway: 5000
- Auth Service: 5001
- Property Service: 5002
- Payment Service: 5003
- Notification Service: 5004
- MongoDB: 27017
- Redis: 6379

## API Endpoints Structure

### Authentication Service (Port 5001)

- POST /auth/login
- POST /auth/register
- POST /auth/refresh
- POST /auth/logout
- GET /auth/profile
- PUT /auth/profile
- POST /auth/forgot-password
- POST /auth/reset-password

### Property Service (Port 5002)

- GET /properties
- GET /properties/{id}
- POST /properties
- PUT /properties/{id}
- DELETE /properties/{id}
- GET /properties/search
- GET /properties/featured
- POST /properties/{id}/reviews
- GET /properties/{id}/reviews

### Payment Service (Port 5003)

- POST /payments/create
- GET /payments/{id}
- POST /payments/confirm
- POST /payments/refund
- GET /payments/history
- GET /payments/methods

### Notification Service (Port 5004)

- GET /notifications
- POST /notifications
- PUT /notifications/{id}/read
- DELETE /notifications/{id}
- POST /notifications/bulk
- GET /notifications/unread-count

## MongoDB Collections Structure

### Users

```json
{
  "_id": "ObjectId",
  "email": "string",
  "password": "string (hashed)",
  "role": "user|owner|staff|admin",
  "profile": {
    "name": "string",
    "phone": "string",
    "avatar": "string",
    "dateOfBirth": "Date",
    "address": "string"
  },
  "isVerified": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Properties

```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "price": "number",
  "location": {
    "address": "string",
    "city": "string",
    "district": "string",
    "coordinates": {
      "lat": "number",
      "lng": "number"
    }
  },
  "images": ["string"],
  "amenities": ["string"],
  "rooms": "number",
  "bathrooms": "number",
  "area": "number",
  "propertyType": "string",
  "owner": "ObjectId",
  "status": "available|rented|maintenance",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Bookings

```json
{
  "_id": "ObjectId",
  "property": "ObjectId",
  "tenant": "ObjectId",
  "startDate": "Date",
  "endDate": "Date",
  "totalAmount": "number",
  "status": "pending|confirmed|cancelled|completed",
  "paymentStatus": "pending|paid|refunded",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Reviews

```json
{
  "_id": "ObjectId",
  "property": "ObjectId",
  "user": "ObjectId",
  "rating": "number",
  "comment": "string",
  "createdAt": "Date"
}
```

### Notifications

```json
{
  "_id": "ObjectId",
  "user": "ObjectId",
  "title": "string",
  "message": "string",
  "type": "info|success|warning|error",
  "read": "boolean",
  "data": "object",
  "createdAt": "Date"
}
```
