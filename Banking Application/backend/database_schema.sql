-- Create database
CREATE DATABASE IF NOT EXISTS banking_system;
USE banking_system;

-- Hybrid transactions table (stores combined ML + Rule-based results)
CREATE TABLE IF NOT EXISTS hybrid_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    oldbalance_org DECIMAL(15, 2),
    newbalance_orig DECIMAL(15, 2),
    oldbalance_dest DECIMAL(15, 2),
    newbalance_dest DECIMAL(15, 2),
    location VARCHAR(100),
    device VARCHAR(50),
    merchant_name VARCHAR(100),
    ml_score DECIMAL(5, 4),
    rule_score DECIMAL(5, 4),
    combined_score DECIMAL(5, 4),
    risk_level VARCHAR(20),
    status VARCHAR(20),
    fraud_reasons TEXT,
    recommendation TEXT,
    transaction_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_risk_level (risk_level),
    INDEX idx_status (status),
    INDEX idx_transaction_time (transaction_time)
);

-- Original transactions table (if not exists)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50),
    transaction_type VARCHAR(20),
    sender_account VARCHAR(50),
    receiver_account VARCHAR(50),
    location VARCHAR(100),
    amount DECIMAL(15, 2),
    status VARCHAR(50),
    fraud_score INT,
    merchant_name VARCHAR(100),
    reasons TEXT,
    transaction_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics view
CREATE OR REPLACE VIEW transaction_analytics AS
SELECT 
    COUNT(*) as total_transactions,
    SUM(CASE WHEN risk_level = 'LOW' THEN 1 ELSE 0 END) as low_risk,
    SUM(CASE WHEN risk_level = 'MEDIUM' THEN 1 ELSE 0 END) as medium_risk,
    SUM(CASE WHEN risk_level = 'HIGH' THEN 1 ELSE 0 END) as high_risk,
    SUM(CASE WHEN risk_level = 'CRITICAL' THEN 1 ELSE 0 END) as critical_risk,
    SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_count,
    SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END) as blocked_count,
    SUM(CASE WHEN status = 'HOLD' THEN 1 ELSE 0 END) as hold_count,
    AVG(combined_score) as avg_fraud_score,
    AVG(ml_score) as avg_ml_score,
    AVG(rule_score) as avg_rule_score
FROM hybrid_transactions;

-- Recent transactions view
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
    transaction_id,
    type,
    amount,
    combined_score,
    risk_level,
    status,
    transaction_time
FROM hybrid_transactions
ORDER BY transaction_time DESC
LIMIT 100;

-- Users table (Admin and Analyst roles)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'ADMIN' or 'ANALYST'
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Analyst actions table (track all analyst decisions)
CREATE TABLE IF NOT EXISTS analyst_actions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL,
    analyst_username VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'APPROVE', 'REJECT', 'ESCALATE', 'ADD_NOTE', 'WHITELIST', 'BLACKLIST'
    original_status VARCHAR(20),
    new_status VARCHAR(20),
    notes TEXT,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES hybrid_transactions(transaction_id),
    FOREIGN KEY (analyst_username) REFERENCES users(username),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_analyst (analyst_username),
    INDEX idx_action_time (action_time)
);

-- Whitelist/Blacklist table
CREATE TABLE IF NOT EXISTS account_lists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id VARCHAR(50) NOT NULL,
    list_type VARCHAR(20) NOT NULL, -- 'WHITELIST' or 'BLACKLIST'
    reason TEXT,
    added_by VARCHAR(50) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (added_by) REFERENCES users(username),
    INDEX idx_account_id (account_id),
    INDEX idx_list_type (list_type)
);

-- User risk profiles table
CREATE TABLE IF NOT EXISTS user_risk_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    total_transactions INT DEFAULT 0,
    fraud_count INT DEFAULT 0,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    avg_transaction_amount DECIMAL(15, 2) DEFAULT 0,
    risk_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
    risk_level VARCHAR(20) DEFAULT 'LOW',
    first_transaction_date TIMESTAMP,
    last_transaction_date TIMESTAMP,
    common_locations TEXT, -- JSON array
    common_devices TEXT, -- JSON array
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_risk_level (risk_level)
);

-- Alerts table (for real-time notifications)
CREATE TABLE IF NOT EXISTS alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'HIGH_RISK', 'SUSPICIOUS_PATTERN', 'LARGE_AMOUNT', etc.
    severity VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    assigned_to VARCHAR(50), -- analyst username
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (transaction_id) REFERENCES hybrid_transactions(transaction_id),
    FOREIGN KEY (assigned_to) REFERENCES users(username),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_is_read (is_read),
    INDEX idx_severity (severity),
    INDEX idx_assigned_to (assigned_to)
);

-- Insert default users (password: 'admin123' and 'analyst123' - should be hashed in production)
INSERT INTO users (username, password, full_name, role, email) VALUES
('admin', 'admin123', 'System Administrator', 'ADMIN', 'admin@bank.com'),
('analyst1', 'analyst123', 'John Analyst', 'ANALYST', 'john@bank.com'),
('analyst2', 'analyst123', 'Sarah Analyst', 'ANALYST', 'sarah@bank.com')
ON DUPLICATE KEY UPDATE username=username;
