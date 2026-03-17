# 🚀 Frontend Setup Guide

## Installation

```bash
cd frontend
npm install
```

## Start Development Server

```bash
npm run dev
```

Open: http://localhost:3000

## Login Credentials

- **Admin**: admin / admin123
- **Analyst**: analyst1 / analyst123

## Features Completed ✅

### 1. Login Page
- Dark theme with animations
- Floating shield icon
- Glow effects on focus
- Demo accounts display

### 2. Dashboard
- Real-time analytics (auto-refresh every 2 seconds)
- 4 stat cards with icons and colors
- 2 doughnut charts (Risk & Status distribution)
- Auto-generation status monitor
- Smooth animations and hover effects

### 3. Manual Check
- 10-input transaction form
- Real-time balance calculation
- Input validation
- Expected balance preview
- Beautiful result card with risk-based colors
- Fraud reasons display

### 4. Transaction History
- Advanced filters (Search, Risk Level, Status)
- Paginated table (20 per page)
- Color-coded badges
- Hover effects
- Empty state handling

### 5. Alerts
- Real-time alert monitoring (auto-refresh every 5 seconds)
- Severity-based colors (HIGH/MEDIUM/LOW)
- Mark as read functionality
- Slide-in animations
- Empty state with success icon

### 6. User Profile
- Search by User ID
- Risk profile display
- Transaction statistics
- Behavioral patterns
- Timeline information
- Color-coded risk badges

### 7. Layout
- Dark sidebar with brand logo
- Collapsible navigation
- Active route highlighting
- Role-based badges (Admin/Analyst)
- Alert counter in navigation
- Smooth transitions

## Design System

### Colors
- Background: #0f1419 (Dark)
- Cards: #1e2738
- Primary: #4c6ef5 (Blue)
- Success: #51cf66 (Green)
- Warning: #ffd43b (Yellow)
- Danger: #ff6b6b (Red)

### Typography
- Font: System fonts (-apple-system, Segoe UI, etc.)
- Headings: 600 weight
- Body: 400 weight

### Components
- Border Radius: 10-20px
- Shadows: Multiple levels with dark theme
- Transitions: 0.3s cubic-bezier
- Animations: Fade in, slide in, pulse

## Tech Stack

- React 18
- Vite (Build tool)
- Styled Components (CSS-in-JS)
- React Router (Navigation)
- Axios (API calls)
- Chart.js + react-chartjs-2 (Charts)
- React Icons (Icons)
- React Toastify (Notifications)

## API Integration

All pages are connected to backend APIs:
- Dashboard: `/api/hybrid/analytics`
- Manual Check: `/api/hybrid/check-realtime`
- History: `/api/analyst/transactions`
- Alerts: `/api/analyst/alerts`
- Profile: `/api/analyst/profile/{userId}`

## Responsive Design

All pages are mobile-friendly with:
- Flexible grids
- Collapsible sidebar
- Responsive tables
- Touch-friendly buttons

## Next Steps

1. Start backend server (Port 8080)
2. Start FastAPI ML service (Port 8000)
3. Start frontend (Port 3000)
4. Login and explore!

**Enjoy your stunning dark-themed fraud detection system!** 🛡️✨
