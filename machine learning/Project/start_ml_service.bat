@echo off
echo ========================================
echo Starting ML Detection Service (Flask)
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python tidak ditemukan!
    echo Silakan install Python 3.8+ terlebih dahulu
    pause
    exit /b 1
)

echo [INFO] Python ditemukan
python --version

REM Deactivate any existing venv to avoid path conflicts
if defined VIRTUAL_ENV (
    echo [INFO] Deactivating existing virtual environment...
    call deactivate >nul 2>&1
)

echo.
echo [INFO] Memeriksa model...
if not exist "weights\best.pt" (
    echo [WARNING] Model weights\best.pt tidak ditemukan!
    echo Pastikan model sudah di-training terlebih dahulu
    echo Jalankan: python scripts\2_train_model.py
    echo.
    pause
)

echo.
REM Check if venv_ml exists, if yes use it
if exist "venv_ml\Scripts\activate.bat" (
    echo [INFO] Menggunakan virtual environment: venv_ml
    call venv_ml\Scripts\activate.bat
)

echo [INFO] Memeriksa dependencies...
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Dependencies belum terinstall!
    echo [INFO] Menginstall dependencies sekarang...
    echo.
    pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics
    if errorlevel 1 (
        echo [ERROR] Gagal menginstall dependencies!
        echo Jalankan manual: pip install -r requirements_ml_api.txt
        pause
        exit /b 1
    )
    echo [INFO] Dependencies berhasil diinstall!
    echo.
)

echo.
echo ========================================
echo Starting Flask ML Service on port 5000
echo ========================================
echo.
echo Service akan berjalan di: http://localhost:5000
echo Tekan CTRL+C untuk menghentikan service
echo.

python ml_api_service.py

pause

