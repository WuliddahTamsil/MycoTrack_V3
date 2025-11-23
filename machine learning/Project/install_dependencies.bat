@echo off
echo ========================================
echo Installing ML Service Dependencies
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo [INFO] Installing dependencies...
echo This may take a few minutes...
echo.

pip install flask==3.0.0 flask-cors==4.0.0 torch torchvision opencv-python numpy Pillow ultralytics

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    echo Try running: pip install -r requirements_ml_api.txt
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed!
echo ========================================
echo.
echo Now you can run: python ml_api_service.py
echo Or double-click: start_ml_service.bat
echo.
pause

