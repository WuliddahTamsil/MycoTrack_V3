@echo off
echo ========================================
echo Installing flask-cors (Quick Fix)
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo [INFO] Installing flask-cors...
echo.

REM Try with pip
pip install flask-cors

if errorlevel 1 (
    echo.
    echo [WARNING] pip install failed, trying with python -m pip...
    python -m pip install flask-cors
)

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    echo.
    echo Try manual:
    echo   1. Deactivate venv: deactivate
    echo   2. Install: pip install flask-cors
    echo   3. Run: python ml_api_service.py
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed!
echo ========================================
echo.
echo Now you can run: python ml_api_service.py
echo.
pause

