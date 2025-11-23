@echo off
echo ========================================
echo Quick Install - ML Dependencies
echo ========================================
echo.

cd /d "%~dp0"

echo Installing all dependencies at once...
echo This may take 10-15 minutes (PyTorch is large)...
echo.

pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics

if errorlevel 1 (
    echo.
    echo Trying with python -m pip...
    python -m pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics
)

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    echo.
    echo Try installing from requirements file:
    echo   pip install -r requirements_ml_api.txt
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed!
echo ========================================
echo.
echo Verifying...
python -c "import torch; print('✅ PyTorch:', torch.__version__)"
python -c "import flask; print('✅ Flask installed')"
python -c "import cv2; print('✅ OpenCV installed')"
echo.
echo Now run: python ml_api_service.py
echo.
pause

