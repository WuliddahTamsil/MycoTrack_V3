@echo off
echo ==========================================
echo   MycoTrack Backend Server Starter
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js tidak terinstall!
    echo Silakan install Node.js dari https://nodejs.org/
    pause
    exit /b 1
)
echo OK: Node.js terdeteksi
node --version
echo.

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Gagal install dependencies!
        pause
        exit /b 1
    )
) else (
    echo OK: Dependencies sudah terinstall
)
echo.

echo [3/3] Starting backend server...
echo.
echo ==========================================
echo   Backend akan berjalan di:
echo   http://localhost:3000
echo ==========================================
echo.
echo Tekan Ctrl+C untuk menghentikan server
echo.

node server.js

if errorlevel 1 (
    echo.
    echo ERROR: Backend gagal berjalan!
    echo Cek error message di atas untuk detail
    pause
    exit /b 1
)
