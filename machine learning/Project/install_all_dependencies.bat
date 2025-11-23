@echo off
echo ========================================
echo Installing ALL ML Service Dependencies
echo ========================================
echo.
echo This will install:
echo   - flask, flask-cors
echo   - torch, torchvision (this may take 10-15 minutes)
echo   - opencv-python, numpy, Pillow
echo   - ultralytics (YOLOv5)
echo.
echo Please be patient, especially for PyTorch installation...
echo.
pause

REM Change to script directory
cd /d "%~dp0"

echo.
echo [1/6] Installing Flask and Flask-CORS...
pip install flask flask-cors
if errorlevel 1 (
    python -m pip install flask flask-cors
)

echo.
echo [2/6] Installing NumPy and Pillow...
pip install numpy Pillow
if errorlevel 1 (
    python -m pip install numpy Pillow
)

echo.
echo [3/6] Installing OpenCV...
pip install opencv-python
if errorlevel 1 (
    python -m pip install opencv-python
)

echo.
echo [4/6] Installing PyTorch (this may take 10-15 minutes)...
echo Please wait, this is a large package...
pip install torch torchvision
if errorlevel 1 (
    echo Trying alternative PyTorch installation...
    python -m pip install torch torchvision
)

echo.
echo [5/6] Installing Ultralytics (YOLOv5)...
pip install ultralytics
if errorlevel 1 (
    python -m pip install ultralytics
)

echo.
echo [6/6] Verifying installation...
python -c "import flask; import flask_cors; import torch; import cv2; import numpy; from PIL import Image; print('✅ All dependencies installed successfully!')"

if errorlevel 1 (
    echo.
    echo [WARNING] Some dependencies may not be installed correctly.
    echo Try installing manually one by one.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo You can now run: python ml_api_service.py
echo Or double-click: start_ml_service.bat
echo.
pause

