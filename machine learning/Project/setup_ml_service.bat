@echo off
echo ========================================
echo Setup ML Detection Service
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo [INFO] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python tidak ditemukan!
    echo Silakan install Python 3.8+ terlebih dahulu
    echo Download dari: https://www.python.org/downloads/
    pause
    exit /b 1
)

python --version
echo.

echo [INFO] Creating new virtual environment...
if exist "venv_ml" (
    echo [INFO] Virtual environment sudah ada, menghapus yang lama...
    rmdir /s /q venv_ml
)

python -m venv venv_ml
if errorlevel 1 (
    echo [ERROR] Gagal membuat virtual environment!
    pause
    exit /b 1
)

echo [INFO] Virtual environment berhasil dibuat!
echo.

echo [INFO] Activating virtual environment...
call venv_ml\Scripts\activate.bat

echo [INFO] Upgrading pip...
python -m pip install --upgrade pip

echo.
echo [INFO] Installing ML service dependencies...
echo Ini mungkin memakan waktu beberapa menit...
echo.

pip install -r requirements_ml_api.txt

if errorlevel 1 (
    echo.
    echo [ERROR] Gagal menginstall dependencies!
    echo Coba jalankan manual: pip install -r requirements_ml_api.txt
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup selesai!
echo ========================================
echo.
echo Untuk menjalankan ML service:
echo   1. Double-click: start_ml_service.bat
echo   2. Atau jalankan: venv_ml\Scripts\activate.bat
echo      kemudian: python ml_api_service.py
echo.
pause

