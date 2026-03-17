# Banking System with API Integration

This project is a Spring Boot application that provides REST API for processing banking transactions with fraud detection.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL database

## Setup

1. Install Maven if not already installed:
   - Download from https://maven.apache.org/download.cgi
   - Add to PATH

2. Ensure MySQL is running and the database `banking_system` exists with the `transactions` table.

3. Update `src/main/resources/application.properties` with your MySQL credentials.

## Running the Application

```bash
mvn clean install
mvn spring-boot:run
```

The application will start on http://localhost:8080

## API Endpoints

### POST /api/transactions
Create a new transaction.

Request Body:
```json
{
  "userId": "U123",
  "transactionType": "DEBIT",
  "senderAccount": "ACC123456",
  "receiverAccount": "ACC654321",
  "location": "Mumbai",
  "device": "DEV001",
  "amount": 5000.0
}
```

Response: Transaction object with status and fraud score.

### GET /api/transactions/balance
Get current balance.

Response: `50000.0`

## Testing the API

You can use tools like Postman or curl to test the endpoints.

Example curl:
```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U123",
    "transactionType": "CREDIT",
    "senderAccount": "ACC123",
    "receiverAccount": "ACC456",
    "location": "Mumbai",
    "device": "DEV001",
    "amount": 10000
  }'
```