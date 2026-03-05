# Collabs+

A full-stack MERN (MongoDB, Express, React, Node.js) application.

## Project Structure

```
Collabs+/
├── backend/              # Express.js backend API
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── server.js         # Entry point
│   └── .env              # Environment variables
├── frontend/             # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   └── vite.config.js
└── package.json          # Root package.json
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation

1. Install all dependencies:
```bash
npm run install-all
```

Or install separately:
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd frontend && npm install
```

2. Configure environment variables:
   - Edit `backend/.env` with your MongoDB URI

### Running the Application

**Development mode (both frontend & backend):**
```bash
npm run dev
```

**Backend only:**
```bash
npm run backend
```

**Frontend only:**
```bash
npm run frontend
```

### Ports
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Dev Tools:** Nodemon, Concurrently

