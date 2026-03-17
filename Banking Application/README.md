# 🛡️ Hybrid Fraud Detection System

Real-time fraud detection using Machine Learning (60%) + Rule-Based Detection (40%)

## 📋 System Overview

- **ML Model**: Random Forest trained on PaySim dataset (6.3M transactions, 8,213 frauds)
- **Rule Engine**: 22 fraud detection rules (PaySim patterns + behavioral analysis)
- **Hybrid Scoring**: Weighted combination (ML 60% + Rules 40%)
- **Real-Time Detection**: Checks transactions BEFORE they complete
- **User Roles**: Admin and Analyst with different permissions

---

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS + Chart.js)
    ↓
Spring Boot Backend (Port 8080)
    ↓
    ├─→ FastAPI ML Service (Port 8000)
    └─→ Rule-Based Detection (22 rules)
    ↓
MySQL Database (banking_system)
```

---

## 📊 Features

### 1. Dashboard
- Real-time analytics with auto-refresh (2 seconds)
- Risk distribution charts (Low/Medium/High)
- Status tracking (Approved/Hold/Blocked)
- Auto-generation monitoring

### 2. Manual Transaction Check
- 10 input fields for comprehensive analysis
- Real-time balance calculation
- Input validation (3 layers: HTML5, JavaScript, Backend)
- Context-aware same-account validation

### 3. Transaction History
- Paginated table with 20 transactions per page
- Advanced filters: Risk Level, Status, Search
- Click to view full transaction details
- Analyst action history

### 4. Real-Time Alerts
- Automatic alerts for HIGH risk transactions
- WhatsApp-style notification dropdown
- Unread alert counter with live updates
- Alert assignment to analysts
- Browser notifications

### 5. Analytics Dashboard
- Confusion Matrix (TP, FP, TN, FN)
- Performance Metrics (Accuracy, Precision, Recall, F1 Score)
- Visual charts for model performance
- Real-time metric updates

### 6. User Risk Profiles
- Customer transaction history
- Fraud rate calculation
- Behavioral patterns (locations, devices)
- Risk score trending (0-100)

### 7. Analyst Actions
- Approve/Reject/Escalate transactions
- Add notes to transactions
- Whitelist/Blacklist accounts
- Full audit trail

### 8. Theme Toggle
- Dark mode (default)
- Light mode
- Smooth transitions
- Persistent preference

---

## 🔧 Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: MySQL 8.0
- **ORM**: JPA/Hibernate
- **Validation**: Jakarta Bean Validation

### ML Service
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **ML Library**: scikit-learn
- **Model**: Random Forest / XGBoost

### Frontend
- **Framework**: React 18 with Vite
- **Language**: JavaScript (JSX)
- **Styling**: Styled Components
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: React Icons (Feather Icons)
- **Routing**: React Router v6
- **Notifications**: React Toastify
- **Theme**: Dark/Light mode with CSS variables

---

## 🚀 Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Python 3.8+
- Node.js (optional, for frontend server)

### 1. Database Setup

```bash
# Create database and tables
mysql -u root -p banking_system < backend/database_schema.sql

# Verify setup
mysql -u root -p -e "USE banking_system; SHOW TABLES;"
```

**Default Users Created:**
- admin / admin123 (ADMIN role)
- analyst1 / analyst123 (ANALYST role)
- analyst2 / analyst123 (ANALYST role)

### 2. Train ML Model

```bash
# Install Python dependencies
pip install pandas numpy scikit-learn fastapi uvicorn

# Train model (takes 2-3 minutes)
python train_paysim_fraud_model.py
```

**Output:** `fraud_model.pkl` (trained model file)

### 3. Start FastAPI (ML Service)

```bash
cd fraud_api
uvicorn app:app --reload --port 8000
```

**Verify:** http://127.0.0.1:8000/docs

### 4. Start Spring Boot Backend

```bash
cd backend
mvn spring-boot:run
```

**Verify:** http://localhost:8080/api/hybrid/health

### 5. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

**Open:** http://localhost:5173

---

## 🎯 Usage

### Login
1. Open http://localhost:5173
2. Login with:
   - Username: `admin` or `analyst1`
   - Password: `admin123` or `analyst123`

### Check Transaction (Manual)
1. Go to "Manual Check" tab
2. Fill in 10 input fields:
   - Transaction Type (PAYMENT, TRANSFER, CASH_OUT, DEBIT, CASH_IN)
   - Amount
   - Source Account ID
   - Destination Account ID
   - Source Current Balance
   - Destination Current Balance
   - User ID
   - Location
   - Device
   - Merchant Name
3. Click "Check Transaction"
4. View result with ML score, Rule score, Combined score
5. Take analyst action if needed (Approve/Reject/Escalate)

### View Transaction History
1. Go to "History" tab
2. Use filters: Risk Level, Status, Search
3. Click "View" to see full details
4. Review analyst actions taken

### Monitor Alerts
1. Go to "Alerts" tab
2. View unread alerts (badge shows count)
3. Click "Mark as Read" to acknowledge
4. Alerts auto-refresh every 2 seconds

### View User Profile
1. Go to "User Profile" tab
2. Enter User ID (e.g., CUST001)
3. Click "Load Profile"
4. View transaction history, fraud rate, risk score

---

## 🧪 Test Cases

### Test 1: Low Risk Transaction
```
Type: PAYMENT
Amount: 5000
Source Account: ACC1234567890
Destination Account: MERCHANT-AMAZON
Source Balance: 100000
Destination Balance: 0
User ID: CUST001
Location: Mumbai
Device: Android
Merchant: Amazon

Expected: LOW risk, APPROVED status
```

### Test 2: High Risk Transaction (Insufficient Funds)
```
Type: TRANSFER
Amount: 500000
Source Account: ACC1234567890
Destination Account: ACC9876543210
Source Balance: 10000
Destination Balance: 0
User ID: CUST002
Location: Foreign
Device: Unknown
Merchant: Unknown

Expected: HIGH risk, BLOCKED status
Reasons: Insufficient funds, Large amount, Suspicious location
```

### Test 3: Medium Risk Transaction
```
Type: CASH_OUT
Amount: 150000
Source Account: ACC1234567890
Destination Account: ATM-001
Source Balance: 200000
Destination Balance: 0
User ID: CUST003
Location: Delhi
Device: ATM-001
Merchant: ATM

Expected: MEDIUM risk, HOLD status
Reasons: Large amount for cash withdrawal
```

---

## 📈 Fraud Detection Rules (22 Total)

### PaySim Pattern Rules (10)
1. Large TRANSFER with balance anomaly
2. Large CASH_OUT with balance anomaly
3. Zero destination balance after large TRANSFER
4. Exact balance drain
5. Round number large transactions
6. Multiple large transactions
7. PAYMENT with balance anomaly
8. Destination balance unchanged after TRANSFER
9. Insufficient funds
10. Suspicious CASH_OUT pattern

### Behavioral Rules (8)
11. Transaction velocity (>5 or >10 transactions)
12. Rapid transaction timing (<1 or <5 minutes)
13. Location change detection
14. Multiple location pattern (4+ locations)
15. Device change detection
16. Suspicious merchant names
17. Unusual transaction time (midnight-4am)
18. Weekend + high amount

### Account-Based Rules (4)
19. Account hopping (multiple accounts)
20. Dormant account activation (>90 days)
21. New account large transaction (<7 days)
22. Suspicious account ID pattern

---

## 🔐 Security Features

- **Input Validation**: 3 layers (HTML5, JavaScript, Backend)
- **SQL Injection Prevention**: Prepared statements
- **XSS Prevention**: Input sanitization
- **CORS**: Configured for localhost
- **Authentication**: Session-based (demo - use JWT in production)
- **Audit Trail**: All analyst actions logged

---

## 📊 Database Schema

### Tables (7)
1. `hybrid_transactions` - All transactions with ML + Rule scores
2. `transactions` - Original transaction table
3. `users` - Admin and Analyst accounts
4. `analyst_actions` - Audit trail of analyst decisions
5. `account_lists` - Whitelist/Blacklist
6. `user_risk_profiles` - Customer behavior tracking
7. `alerts` - Real-time notifications

---

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, mobile
- **Real-Time Updates**: Auto-refresh every 2 seconds
- **Interactive Charts**: Doughnut and Bar charts
- **Color-Coded Risk Levels**: Green (Low), Yellow (Medium), Red (High)
- **Modal Dialogs**: Transaction details, Login
- **Alert Banners**: High-risk transaction notifications
- **Pagination**: 20 transactions per page
- **Filters**: Multi-criteria search and filter

---

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials in `application.properties`
- Ensure port 8080 is available

### FastAPI won't start
- Check Python dependencies installed
- Verify `fraud_model.pkl` exists
- Ensure port 8000 is available

### Frontend shows errors
- Check backend is running (port 8080)
- Check FastAPI is running (port 8000)
- Open browser console for error details

### Database errors
- Verify all tables created: `SHOW TABLES;`
- Check foreign key constraints
- Ensure users table has 3 default users

---

## 📝 API Endpoints

### Hybrid Detection
- `POST /api/hybrid/check-realtime` - Real-time transaction check
- `GET /api/hybrid/analytics` - Dashboard statistics
- `GET /api/hybrid/health` - Health check

### Analyst Actions
- `POST /api/analyst/action` - Perform analyst action
- `GET /api/analyst/transactions` - Get transaction history
- `GET /api/analyst/transaction/{id}` - Get transaction details
- `GET /api/analyst/alerts` - Get unread alerts
- `POST /api/analyst/alerts/{id}/read` - Mark alert as read
- `GET /api/analyst/profile/{userId}` - Get user risk profile
- `GET /api/analyst/confusion-matrix` - Get confusion matrix metrics

---

## 🚀 Future Enhancements

- [ ] JWT authentication
- [ ] Password hashing (bcrypt)
- [ ] Email/SMS notifications
- [ ] Export to CSV/Excel
- [ ] Advanced analytics dashboard
- [ ] Machine learning model retraining
- [ ] Multi-language support
- [x] Dark mode
- [x] WhatsApp-style notifications
- [x] Confusion matrix analytics
- [ ] Mobile app

---

## 📄 License

This is a demo project for educational purposes.

---

## 👥 Contributors

- System designed for bank analysts and administrators
- Built with real-world fraud detection patterns
- Based on PaySim synthetic financial dataset

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify all services are running

---

**Ready to detect fraud? Start all services and open http://localhost:5173** 🛡️

---

## 🎉 New Features Added

### 1. Bell Notification Dropdown (WhatsApp-style)
- Click bell icon in header to view notifications
- Shows last 5 alerts with severity indicators
- Time ago format (e.g., "2m ago", "1h ago")
- Click notification to navigate to Alerts page
- Auto-closes when clicking outside
- Live badge counter with pulse animation

### 2. Theme Toggle (Dark/Light Mode)
- Sun/Moon icon in header
- Smooth transitions between themes
- Persistent preference (localStorage)
- All components adapt to theme
- Professional color schemes for both modes

### 3. Analytics Dashboard
- Confusion Matrix visualization
- True Positive (TP): Correctly identified fraud
- False Positive (FP): Legitimate flagged as fraud
- True Negative (TN): Correctly identified legitimate
- False Negative (FN): Missed fraud cases
- Performance metrics: Accuracy, Precision, Recall, F1 Score
- Real-time updates every 5 seconds
- Interactive charts with Chart.js
