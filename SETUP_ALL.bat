@echo off
echo ========================================
echo SETUP LENGKAP - ML Detection Integration
echo ========================================
echo.
echo Script ini akan:
echo   1. Install axios di backend
echo   2. Install semua dependencies ML service
echo   3. Verifikasi semua setup
echo.
pause

REM ========================================
REM STEP 1: Install Backend Dependencies
REM ========================================
echo.
echo ========================================
echo STEP 1: Installing Backend Dependencies
echo ========================================
cd /d "%~dp0\backend"
echo.
echo [INFO] Installing axios and form-data...
call npm install axios form-data
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies!
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed!

REM ========================================
REM STEP 2: Install ML Service Dependencies
REM ========================================
echo.
echo ========================================
echo STEP 2: Installing ML Service Dependencies
echo ========================================
cd /d "%~dp0\machine learning\Project"
echo.
echo [INFO] This will take 10-15 minutes (PyTorch is large)...
echo [INFO] Installing all ML dependencies...
echo.

pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics tqdm pandas matplotlib seaborn

if errorlevel 1 (
    echo.
    echo [WARNING] Some packages failed, trying with python -m pip...
    python -m pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics tqdm pandas matplotlib seaborn
)

echo.
echo [OK] ML dependencies installed!

REM ========================================
REM STEP 3: Verification
REM ========================================
echo.
echo ========================================
echo STEP 3: Verifying Installation
echo ========================================
echo.

echo [INFO] Checking backend dependencies...
cd /d "%~dp0\backend"
if exist "node_modules\axios" (
    echo [OK] axios installed
) else (
    echo [WARNING] axios not found in node_modules
)

echo.
echo [INFO] Checking ML dependencies...
cd /d "%~dp0\machine learning\Project"
python -c "import flask; import flask_cors; import torch; import cv2; import tqdm; print('[OK] All ML dependencies installed!')" 2>nul
if errorlevel 1 (
    echo [WARNING] Some ML dependencies may be missing
)

echo.
echo ========================================
echo SETUP COMPLETED!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Start ML Service (Terminal 1):
echo    cd "machine learning\Project"
echo    python ml_api_service.py
echo.
echo 2. Start Backend (Terminal 2):
echo    cd backend
echo    npm start
echo.
echo 3. Frontend should already be running
echo.
echo 4. Test: Upload foto di dashboard dan klik Deteksi
echo.
pause

