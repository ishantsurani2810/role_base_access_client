# SecureAuth Client Module

This is the React frontend application built with Vite and vanilla CSS layout classes. It represents the user dashboard and product catalog interface, managing display layers dynamically based on active privileges.

---

## 🛠️ Tech Stack & Libraries
* **Build Engine:** Vite (React)
* **Routing:** React Router V6
* **HTTP Client:** Axios (configured with auto-refresh interceptors for silent token rotations)
* **Icons:** Lucide Icons
* **Styling:** Custom Vanilla CSS Classes (defined in `src/index.css`)

---

## 🚀 Getting Started

### 1. Requirements
* **Node.js** (v18+)

### 2. Startup Command
Navigate to the client folder, install dependencies, and start the development server:
```bash
# Install dependencies
npm install

# Start local server
npm run dev
```
*The application should launch in your browser at: `http://localhost:5173`*

---

## 📁 Key Files & Directories
* **`src/layouts/DashboardLayout.jsx`** - General layout with sidebar, navigation guard, and logout triggers.
* **`src/views/dashboard/DashboardHome.jsx`** - Landing page welcome dashboard, containing the "What Each Role Can Do" card visible strictly to the `Admin` role.
* **`src/views/products/ProductsList.jsx`** - Product management catalog grid and modals rendering prices in Indian Rupees (₹).
* **`src/views/users/UserManagement.jsx`** - System directory containing the direct override panels for custom user permissions.
* **`src/context/PermissionContext.jsx`** - Dynamic client checker offering the `can(module, action)` access guard.
* **`src/services/api.js`** - Axios API client config intercepting errors and handling JWT requests.
