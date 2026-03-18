CREATE DATABASE IF NOT EXISTS banking_db;
USE banking_db;

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    txn_id VARCHAR(20),

    transaction_type VARCHAR(20),
    transaction_mode VARCHAR(20),
    amount DECIMAL(12,2),
    txn_time DATETIME,

    sender_id VARCHAR(20),
    sender_account VARCHAR(20),
    sender_mobile VARCHAR(15),
    sender_device VARCHAR(50),
    sender_location VARCHAR(50),

    receiver_id VARCHAR(20),
    receiver_account VARCHAR(20),
    receiver_mobile VARCHAR(15),
    receiver_location VARCHAR(50),

    auth_type VARCHAR(20),
    ip_address VARCHAR(50),

    risk_score INT,
    status VARCHAR(30),
    failure_reason VARCHAR(255),
    balance DECIMAL(12,2)
);
DESCRIBE transactions;
SELECT * FROM transactions ORDER BY id;



