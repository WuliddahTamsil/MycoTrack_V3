@echo off
echo ========================================
echo FORCE RESTART BACKEND
echo ========================================
echo.
echo This will:
echo   1. Kill all Node.js processes
echo   2. Kill port 3000
echo   3. Start backend server
echo.
pause

cd /d "%~dp0"

echo.
echo [1/3] Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Killing port 3000...
call npm run kill:3000

timeout /t 2 /nobreak >nul

echo.
echo [3/3] Starting backend server...
echo.
echo ========================================
echo Backend server starting...
echo ========================================
echo.
echo IMPORTANT: 
echo - Keep this window open
echo - Wait for "Backend server running" message
echo - Then test login in browser
echo.
echo ========================================
echo.

cd backend
npm start

pause

