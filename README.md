# EZStay Frontend

> Đã xong trang Home, Register, Login

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

## 🔗 Connecting to Backend (ASP.NET, etc.)

- Create file `.env.local`:
  
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000
  ```

- All API calls will use this URL. If not set, the app will use mock data for development.
- Make sure your backend enables CORS for the frontend domain.

---

> EZStay - Modern Room Rental Platform
