@echo off
echo ========================================================================
echo HYBRID FRAUD DETECTION SYSTEM - STARTUP
echo ========================================================================
echo.
echo This will start all components of the fraud detection system:
echo 1. FastAPI (Python ML Model) - Port 8000
echo 2. Spring Boot (Java Rules) - Port 8080
echo 3. Frontend Dashboard - Port 3000
echo.
echo Make sure you have:
echo - Python with FastAPI installed
echo - Java 17+ and Maven
echo - MySQL running with database created
echo.
pause

echo.
echo [1/3] Starting FastAPI (Python ML Model)...
start cmd /k "cd fraud_api && uvicorn app:app --reload"
timeout /t 3

echo.
echo [2/3] Starting Spring Boot (Java Rules + Hybrid)...
start cmd /k "cd backend && mvn spring-boot:run"
timeout /t 5

echo.
echo [3/3] Starting Frontend Dashboard...
start cmd /k "cd frontend && python -m http.server 3000"
timeout /t 2

echo.
echo ========================================================================
echo ALL SERVICES STARTED!
echo ========================================================================
echo.
echo FastAPI:      http://127.0.0.1:8000
echo Spring Boot:  http://localhost:8080
echo Frontend:     http://localhost:3000
echo.
echo Auto-generation: 1 transaction every 5 seconds
echo.
echo Press any key to open frontend in browser...
pause
start http://localhost:3000
