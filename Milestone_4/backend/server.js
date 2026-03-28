const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8081;
const JWT_SECRET = 'super-secret-key-123';

app.use(cors());
app.use(express.json());

// In-memory data stores
const users = [];
const transactions = [
  {
    transactionId: "TXN1001",
    transactionType: "Debit",
    transactionMode: "UPI",
    amount: 15000,
    senderId: "U101",
    senderAccount: "ACC001",
    senderMobile: "9876543210",
    senderDevice: "Android",
    senderLocation: "Mumbai",
    receiverId: "U102",
    receiverAccount: "ACC002",
    receiverMobile: "9876543211",
    receiverLocation: "Delhi",
    authType: "OTP",
    isFraud: false,
    fraudScore: 0.12,
    date: new Date().toISOString()
  }
];

// ==========================================
// Authentication Endpoints
// ==========================================

// Signup
app.post('/api/auth/signup', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    // Check if user already exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
        return res.status(400).send('Username or email already exists');
    }

    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password // Storing in plain text purely for mock API purposes
    };
    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({
        user: { id: newUser.id, username: newUser.username, email: newUser.email },
        token
    });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).send('Invalid username or password');
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({
        user: { id: user.id, username: user.username, email: user.email },
        token
    });
});

// ==========================================
// Transactions Endpoints
// ==========================================

// Get all transactions
app.get('/api/transactions', (req, res) => {
    res.status(200).json(transactions);
});

// Create new transaction
app.post('/api/transactions', (req, res) => {
    const transactionData = req.body;
    
    // Simple mock fraud detection logic
    const fraudScore = Math.random();
    const isFraud = fraudScore > 0.7;
    
    const newTx = {
        ...transactionData,
        id: Date.now().toString(),
        amount: parseFloat(transactionData.amount) || 0,
        isFraud: isFraud,
        fraudScore: parseFloat(fraudScore.toFixed(4)),
        date: new Date().toISOString(),
        message: isFraud ? "High risk transaction detected!" : "Transaction processed successfully."
    };
    
    transactions.unshift(newTx); // Add to beginning of array
    res.status(201).json(newTx);
});

// Batch create transactions
app.post('/api/transactions/batch', (req, res) => {
    const transactionsList = req.body;
    
    if (!Array.isArray(transactionsList)) {
        return res.status(400).send('Expected an array of transactions');
    }

    const processed = transactionsList.map(tx => {
        const fraudScore = Math.random();
        const isFraud = fraudScore > 0.7;
        return {
            ...tx,
            id: (Date.now() + Math.random()).toString(),
            amount: parseFloat(tx.amount) || 0,
            isFraud: isFraud,
            fraudScore: parseFloat(fraudScore.toFixed(4)),
            date: new Date().toISOString(),
            message: isFraud ? "High risk transaction detected!" : "Transaction processed successfully."
        };
    });

    transactions.unshift(...processed);
    res.status(201).json(processed);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server successfully running on port ${PORT}`);
});
