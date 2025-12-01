@echo off
echo Starting Green Call CRM Development Environment...

echo.
echo 1. Starting MongoDB (if not running)...
net start MongoDB 2>nul || echo MongoDB service not found or already running

echo.
echo 2. Creating test user...
cd server
node createNavneetUser.js
echo.

echo 3. Starting Backend Server...
start "Backend Server" cmd /k "npm start"

echo.
echo 4. Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 5. Starting Frontend Client...
cd ..\client
start "Frontend Client" cmd /k "npm start"

echo.
echo ✅ Development environment started!
echo 📧 Login with: navneet@greencall.com
echo 🔑 Password: navneet
echo.
echo Backend: http://localhost:5005
echo Frontend: http://localhost:3000
echo.
pause