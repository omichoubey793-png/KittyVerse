# 🐾 KittyVerse

> **"Because Every Paw Deserves a Forever Home."** 🐾

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Hosting: Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel)](https://vercel.com/)
[![Hosting: Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://render.com/)

KittyVerse is a modern, production-ready cat shelter and adoption platform. It connects rescue operations with loving adopters through a secure, intuitive, and highly responsive web dashboard. From rescue intake tracking and medical vaccination schedules to AI-powered insights, KittyVerse simplifies shelter administration.

---

## Core Features

- ** Intake & Shelter Management**: Log rescues, customize details, assign caretakers, track breeds, ages, and genders, and manage housing units.
- ** Vaccination & Medical Records**: Real-time immunization logs, scheduled boosters, clinic visits, and auto-generated PDFs.
- ** Adoption Pipeline**: Dynamic review flow for adoption applications (Pending, Approved, Rejected) with animal-matching criteria.
- ** Fanny AI Health Assistant**: Integrated Google Gemini AI chatbot providing recommendations, diet plans, and recovery diagnostics.
- ** Interactive Analytics Bento**: Dynamic dashboards calculating donation rates, wellness index metrics, and shelter growth trends.
- ** Secure Authentication**: JSON Web Token (JWT) secured sessions with role-based access control (Admin vs. Staff vs. Guest).

---

## 🛠️ Tech Stack

### Frontend
- **Markup**: Semantic HTML5
- **Logic**: Vanilla JavaScript (ES6 Modules)
- **Styling**: Tailwind CSS & Vanilla CSS (Custom tokens)
- **Icons**: Lucide Icons & Google Material Symbols

### Backend
- **Framework**: Node.js & Express
- **Database**: MongoDB (Object modeling via Mongoose)
- **File Management**: Cloudinary API (Image uploads)
- **AI Engine**: Google Gemini API
- **Document Generation**: PDFKit (Medical reporting)

---

## 📁 Repository Structure

```text
KittyVerse/
├── frontend/             # Static Frontend Web App
│   ├── assets/           # UI media, icons, and SVG illustrations
│   ├── css/              # Shared styles, layouts, and animations
│   ├── js/               # Local app controllers and modules
│   │   ├── config.js     # API Base URL Environment router
│   │   └── ...           # Sidebar, login, and chatbot services
│   ├── index.html        # Public-facing Landing Page
│   ├── vercel.json       # Vercel URL routing settings
│   └── package.json      # Frontend serve script config
│
├── backend/              # Node.js API Service
│   ├── src/
│   │   ├── config/       # MongoDB and Cloudinary setup files
│   │   ├── controllers/  # API endpoints handlers (auth, animals, etc.)
│   │   ├── middleware/   # JWT verification & role validation
│   │   ├── models/       # Database schemas (User, Animal, Adoption)
│   │   └── routes/       # Express route mappings
│   ├── package.json      # NPM dependencies & start commands
│   └── server.js         # API entrypoint
│
└── vercel.json           # Root URL subdirectory router
```

---

##  Local Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/) account or local MongoDB server

### 1. Setup the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 2. Setup the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install local dev dependency to serve static files:
   ```bash
   npm install
   ```
3. Start the local server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

### Frontend (Vercel)
The project includes a root-level [vercel.json](file:///D:/nw/KittyVerseAI/KittyVerseAI/vercel.json) rewrite file. You can deploy it by simply linking your GitHub repository to Vercel:
1. Choose **Import Project** on Vercel.
2. Select the repository root.
3. Vercel will automatically read the root-level routing and serve the `frontend/` directory.

### Backend (Render)
1. Select **New Web Service** on Render and connect your repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add the environment variables (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.) in the **Environment** tab.

---

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

🐾 *Developed with care for the feline community.*
