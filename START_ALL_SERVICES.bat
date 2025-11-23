@echo off
echo ========================================
echo STARTING ALL SERVICES
echo ========================================
echo.
echo This will start:
echo   1. ML Service (port 5000)
echo   2. Backend (port 3000)
echo.
echo Frontend should be started separately
echo.
pause

cd /d "%~dp0"

REM Start ML Service in new window
echo [INFO] Starting ML Service...
start "ML Service" cmd /k "cd /d %~dp0machine learning\Project && python ml_api_service.py"

timeout /t 3 /nobreak >nul

REM Start Backend in new window
echo [INFO] Starting Backend...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm start"

echo.
echo ========================================
echo Services started!
echo ========================================
echo.
echo ML Service: http://localhost:5000
echo Backend: http://localhost:3000
echo.
echo Check the new windows for service status
echo.
pause

