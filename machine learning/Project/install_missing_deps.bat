@echo off
echo ========================================
echo Installing Missing Dependencies
echo ========================================
echo.

cd /d "%~dp0"

echo [INFO] Installing tqdm and other missing dependencies...
echo.

pip install tqdm pandas matplotlib seaborn

if errorlevel 1 (
    echo.
    echo Trying with python -m pip...
    python -m pip install tqdm pandas matplotlib seaborn
)

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    echo.
    echo Try manual:
    echo   pip install tqdm pandas matplotlib seaborn
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed!
echo ========================================
echo.
echo Now RESTART your ML service:
echo   1. Stop ML service (CTRL+C)
echo   2. Start again: python ml_api_service.py
echo.
pause

