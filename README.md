# FoodBridge — Food Donation & Redistribution Platform

> A comprehensive college major project built with the pure MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Overview

FoodBridge connects surplus-food donors (restaurants, caterers, institutions, individuals) with verified NGOs and volunteer networks to ensure timely, traceable, and dignified food redistribution to communities in need.

### Key Roles
- **Donor**: Publishes surplus food listings, manages offerings, reviews and approves NGO requests.
- **NGO (Recipient)**: Browses available food, submits quantity claims after administrative verification, coordinates distribution.
- **Volunteer**: Accepts assigned pickups, verifies collection with donors, and confirms delivery to recipient organizations.
- **Admin**: Verifies NGO credentials, monitors account activity, reviews audit logs, and inspects platform analytics.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 / Vite, Tailwind CSS, React Router, Lucide Icons
- **Backend**: Node.js & Express.js (Modular REST API)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT stored in secure `HttpOnly` cookies (XSS & CSRF hardened)
- **Validation & Security**: Server-side validation, Role-Based Access Control (RBAC), Helmet, rate limiting

---

## 📚 Project Documentation

Detailed specifications and architectural guides are available in the [`docs/`](./docs) folder:
- [Product Requirements Document (PRD)](./docs/FoodBridge_PRD.md)
- [Technical Requirements Document (TRD)](./docs/FoodBridge_TRD.md)

---

## 🔒 Security & Best Practices

- Strictly enforced server-side authorization on every route.
- Atomic conditional reservations preventing duplicate or concurrent claims.
- Location privacy shielding: Exact donor address revealed only to approved transaction participants.
- Sanitized CSV exports with defense against spreadsheet formula injection.

---

## 📄 License
This project is developed for academic evaluation.
