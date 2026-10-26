# FoodBridge — Food Donation & Redistribution Platform

> A comprehensive college major project built with the pure MERN stack (MongoDB, Express.js, React.js, Node.js).

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-v4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_v8-brightgreen.svg)](https://mongoosejs.com/)

---

## 🚀 Overview

FoodBridge connects surplus-food donors (restaurants, caterers, institutions, individuals) with verified NGOs and volunteer networks to ensure timely, traceable, and dignified food redistribution to communities in need.

### The 4 Core Roles
1. **Donor**: Publishes surplus food listings, manages active listings, reviews and approves NGO requests.
2. **NGO (Recipient)**: Browses available food, submits quantity claims after administrative verification, coordinates distribution.
3. **Volunteer**: Accepts assigned pickups, verifies collection with donors, and confirms delivery to recipient organizations.
4. **Admin**: Verifies NGO credentials, monitors account activity, reviews audit logs, and inspects platform analytics.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19 + Vite, Tailwind CSS, React Router, Lucide Icons
- **Backend**: Node.js & Express.js (Modular REST API)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT stored in secure `HttpOnly` cookies (XSS & CSRF hardened)
- **Security & Validation**: Server-side validation, Role-Based Access Control (RBAC), Helmet, rate limiting

---

## 📚 Project Documentation

Detailed specifications and architectural guides are in the [`docs/`](./docs) folder:
- [Product Requirements Document (PRD)](./docs/FoodBridge_PRD.md)
- [Technical Requirements Document (TRD)](./docs/FoodBridge_TRD.md)

---

## 💻 Local Setup & Startup Commands

### Prerequisites
- **Node.js**: v20 or higher (`node -v`)
- **MongoDB**: Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

---

### 1. Environment Configuration

Copy the example environment file to both `server/.env` and `client/.env`:

```bash
# Server environment
cp .env.example server/.env

# Client environment
cp .env.example client/.env
```

**Key Server Variables (`server/.env`)**:
```ini
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/foodbridge
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
COOKIE_NAME=foodbridge_token
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Key Frontend Variables (`client/.env`)**:
```ini
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

### 2. Running Locally

Open two terminal windows:

#### Terminal 1 — Start the Express API Backend:
```bash
cd server
npm install
npm run dev
```
*Server starts at `http://localhost:5000`*

#### Terminal 2 — Start the Vite React Frontend:
```bash
cd client
npm install
npm run dev
```
*Frontend starts at `http://localhost:5173`*

---

### 3. Health & Diagnostic Endpoints

The API includes health and diagnostic routes reporting service status without exposing sensitive credentials:

- **Health Check**: `GET http://localhost:5000/api/v1/health` (or `/health`)
  ```json
  {
    "status": "healthy",
    "service": "FoodBridge REST API",
    "version": "1.0.0",
    "environment": "development",
    "uptimeSeconds": 142,
    "timestamp": "2026-10-27T01:45:00.000Z",
    "database": {
      "status": "connected",
      "connected": true
    }
  }
  ```

---

### 4. Running Automated Tests

Run the backend integration test suite:
```bash
cd server
npm test
```

---

## 🗺️ Project Structure

```
foodbridge/
├── client/                     # Frontend React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # apiClient.js (Axios)
│   │   ├── App.jsx             # Main application layout & health inspector
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── tailwind.config.js      # Custom theme & brand color tokens
│   └── vite.config.js
│
├── server/                     # Backend Express.js REST API
│   ├── src/
│   │   ├── config/             # env.js (validation), db.js (Mongoose connection)
│   │   ├── middleware/         # errorHandler.js, security middlewares
│   │   ├── routes/             # healthRoutes.js
│   │   ├── app.js              # Express app configuration & middlewares
│   │   └── server.js           # Server entrypoint with graceful shutdown
│   ├── tests/                  # Automated integration tests (node:test + supertest)
│   └── package.json
│
├── docs/                       # PRD & TRD documentation
│   ├── FoodBridge_PRD.md
│   └── FoodBridge_TRD.md
├── .env.example                # Canonical environment template
├── .gitignore                  # Git exclusions
├── package.json                # Root package scripts
└── README.md                   # Project documentation
```

---

## 📄 License
This project is developed for academic evaluation.
