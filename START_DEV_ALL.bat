@echo off
echo ========================================
echo Starting MycoTrack - All Services
echo ========================================
echo.
echo This will start:
echo   1. ML Service (port 5000)
echo   2. Backend (port 3000)
echo   3. Frontend (port 5173)
echo.
echo ========================================
echo.

cd /d "%~dp0"

echo Installing dependencies if needed...
call npm run install:all

echo.
echo ========================================
echo Starting all services...
echo ========================================
echo.
echo ML Service:    http://localhost:5000
echo Backend:       http://localhost:3000
echo Frontend:      http://localhost:5173
echo.
echo Press Ctrl+C to stop all servers
echo.

npm run dev:all

pause

