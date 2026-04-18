# Smart Parking Management System

A robust, full-stack parking management solution emphasizing clean architecture, design patterns, and a premium user experience.

## 🚀 Live Demo
- **Backend API**: `https://smart-parking-management-system-mwiw.onrender.com`
- **Frontend Dashboard**: `https://smart-parking-management-system-topaz.vercel.app/`

## 🔐 Credentials
- **Admin Access**: 
  - Username: `admin`
  - Password: `admin123`
- **Driver Access**: 
  - Any unique username and password! (System uses auto-registration for new drivers).

## 🛠️ Tech Stack & Architecture
- **Backend**: Node.js, TypeScript, Express.
- **Frontend**: React (Vite), Professional Light UI, Responsive Design.
- **Patterns**:
  - **Strategy Pattern**: Flexible Pricing calculations.
  - **State Pattern**: Slot status management (Available, Reserved, Occupied).
  - **Factory Pattern**: Vehicle object instantiation.
  - **Observer Pattern**: Real-time status logging and dashboard synchronization.

## 📦 Installation & Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📜 Architecture Summary
The backend is built with a strictly decoupled **Controller-Service-Repository** architecture. Logic is encapsulated within services, while repositories handle data persistence (currently in-memory Maps). 
