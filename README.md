# Digital-Banking-Fraud-Detection

A Java-based simulation system for detecting potentially fraudulent banking transactions using rule-based risk scoring and MySQL database integration.

##  Project Overview

This project simulates banking transactions and applies rule-based fraud detection logic to evaluate risk levels.  
Each transaction is assigned a fraud score based on predefined conditions such as transaction amount, location change, authentication type, and transaction frequency.
The system then classifies transactions into categories like SUCCESS, SUSPICIOUS, FLAGGED, or FRAUD-BLOCKED and stores them in a MySQL database.


## Tech Stack

- **Language:** Java  
- **Database:** MySQL  
- **Connectivity:** JDBC  

---

## Key Features

- Simulation of Credit and Debit transactions
- Rule-based fraud risk scoring engine
- Location anomaly detection
- High-value transaction detection
- Authentication type risk evaluation
- Automatic status classification
- Real-time storage of transactions in MySQL



## Fraud Classification Logic

| Risk Score | Status         | Description |
|------------|---------------|------------|
| < 30       | SUCCESS        | Normal transaction |
| 30 – 49    | SUSPICIOUS     | Moderate risk indicators detected |
| 50 – 79    | FLAGGED        | High-risk patterns present |
| ≥ 80       | FRAUD-BLOCKED  | Transaction blocked due to high fraud score |
| Debit > Balance | FAILED | Insufficient balance |


## Database

The SQL schema is available in the `/database` folder.

## How to Run

1. Install MySQL and create a database named `banking_db`.
2. Execute the SQL schema from the `/database` folder.
3. Update database credentials in the Java file.
4. Compile and run:
  javac FraudDetectionEngine.java
  java FraudDetectionEngine
5. View transaction records in MySQL Workbench.

