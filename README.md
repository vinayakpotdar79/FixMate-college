# 🛠️ FixMate – College Maintenance Management System

A modern, responsive full-stack web application to manage maintenance issues in educational institutions. FixMate streamlines issue reporting, resolution tracking, and user role management for improved maintenance workflow.

## 🔐 Features

- 🧑‍🏫 **Role-Based Access**
  - Admin, Reporter, Maintainer
- 📝 **Issue Reporting**
  - Users can report issues with floor, room, and device info
- ✅ **Maintenance Workflow**
  - Assign, track, and mark issues as resolved
- 📊 **Admin Panel**
  - View all issues in a table with Excel download option
- 📅 **Time Zone Handling**
  - All timestamps shown in IST (Indian Standard Time)
- 🔒 **Secure Auth**
  - Session-based login with Passport.js and bcrypt
- 🌐 **Responsive Design**
  - Fully mobile and desktop optimized

---

## 🧩 Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- Axios
- React Router

**Backend:**
- Node.js
- Express.js
- PostgreSQL 
- Passport.js for authentication

**Tools:**
- Vite
- Bcrypt
- Dotenv
- ExcelJS for Excel export

---

## ⚙️ Installation

### Backend Setup
```bash
cd server
npm install
Create a .env file:
PORT=3000
SESSION_SECRET=your_secret_key
DB_URL=your_postgres_connection_url
Run backend:
npm start
```
### Frontend Setup
```bash
cd client
npm install
Run frontend:
npm run dev
```
