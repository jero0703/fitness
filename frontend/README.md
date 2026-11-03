# FitTrack – Frontend Application

FitTrack Frontend is a modern, responsive single-page web application built with **React**, **Vite**, **Tailwind CSS**, and **Recharts**. It provides an intuitive, high-performance dashboard inspired by premium fitness SaaS platforms.

---

## 1. Tech Stack

- **React 19**: Modern component-driven UI
- **Vite 6**: Fast development server and optimized build tool
- **Tailwind CSS**: Utility-first styling with custom fitness theme
- **React Router DOM v7**: Client-side routing with protected route guards
- **Axios**: Centralized HTTP client with automatic JWT token attachment and 401 interceptors
- **Recharts**: Responsive data visualization (Bar, Line, Area, and Pie charts)
- **Lucide React**: Clean, modern icons
- **React Toastify**: Interactive feedback toasts for all CRUD operations

---

## 2. Directory Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/            # Reusable UI components
│   │   ├── StatCard.jsx
│   │   ├── WorkoutModal.jsx   # Add/Edit workout modal
│   │   ├── GoalModal.jsx      # Add/Edit fitness goal modal
│   │   └── DeleteConfirmModal.jsx
│   ├── context/
│   │   └── AuthContext.jsx    # Global JWT authentication context
│   ├── layouts/
│   │   └── DashboardLayout.jsx# Responsive sidebar, top header, & notifications
│   ├── pages/                 # Route page views
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Dashboard.jsx      # Main summary & quick analytics
│   │   ├── Workouts.jsx       # Workout logging, filtering & search
│   │   ├── Progress.jsx       # Daily, weekly, and monthly tracking
│   │   ├── Goals.jsx          # Goal milestones & progress bars
│   │   ├── Analytics.jsx      # 5 Recharts visualizations
│   │   ├── Notifications.jsx  # Notification management & alert simulation
│   │   └── Settings.jsx       # Profile & application preferences
│   ├── routes/
│   │   └── ProtectedRoute.jsx # Route authentication guard
│   ├── services/
│   │   └── api.js             # Centralized Axios client & API endpoints
│   ├── App.jsx                # Router setup & Toast provider
│   ├── index.css              # Tailwind CSS directives & global scrollbar
│   └── main.jsx               # Entrypoint
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 3. Design System & Theme

| Element | Hex Code / Specification | Description |
|---|---|---|
| **Primary Background** | `#F8FAFC` | Clean slate background |
| **Sidebar Navigation** | `#111827` | Dark slate premium contrast |
| **Primary Accent** | `#22C55E` | Emerald green for success, workouts, & energy |
| **Secondary Accent** | `#14B8A6` | Teal for goals and progress metrics |
| **Cards** | `#FFFFFF` | Elevated white cards with subtle border & shadow |
| **Text Primary** | `#1F2937` | High contrast readable typography |
| **Text Muted** | `#64748B` | Subtitle and metadata text |

---

## 4. Setup & Run Instructions (Windows PowerShell)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Start Development Server
```powershell
npm run dev
```
The application will launch at: `http://localhost:5173`

### Step 3: Production Build
```powershell
npm run build
```
Generates production-optimized static assets in `dist/`.

---

## 5. Key Features

1. **Authentication Flow**:
   - Secure login and registration with instant JWT storage in `localStorage`.
   - Automatic Bearer token header injection on all requests.
   - Smooth session recovery and automatic redirect to `/login` upon 401 token expiry.
   - "Auto Fill Demo Account" button on the Login page for one-click testing (`alex@fittrack.com`).

2. **Workout Management**:
   - Log workouts across Cardio, Strength, Yoga, HIIT, Pilates, Running, Cycling, Swimming, etc.
   - Live calorie estimation tool based on category and duration.
   - Filter workouts by category, date range, or search by workout title.
   - Edit and delete workouts with instant confirmation modals.

3. **Daily Progress Aggregation**:
   - Automatic daily calculation of workouts, calories, and duration.
   - Prevents duplicate progress records.
   - Date picker to view historic progress for any day.
   - Rolling 7-day bar chart and monthly week-by-week analysis.

4. **Fitness Goals**:
   - Create goals (Weight Loss, Steps, Workouts, Running, etc.) with deadlines.
   - Automatic status calculation: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`.
   - Quick increment/decrement buttons (+1, +5) for rapid progress updates.
   - Automatic celebration notification upon achieving a goal.

5. **Recharts Analytics Dashboard**:
   - Weekly Workout Frequency Bar Chart
   - Monthly Progress Trend 30-Day Line Chart
   - 14-Day Calorie Expenditure Area Chart
   - Workout Category Distribution Pie Chart
   - Minutes Trained by Category Horizontal Bar Chart

6. **Notification System**:
   - Top-bar notification bell with unread count badge.
   - Quick-access dropdown preview.
   - Dedicated notification management page with filter for unread alerts.
   - "Simulate Reminders" button to trigger automated reminder checking.
