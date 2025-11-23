@echo off
echo ========================================
echo Restarting MycoTrack Backend Server
echo ========================================
cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo Stopping any existing server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo.

echo Starting server...
node server.js
pause

