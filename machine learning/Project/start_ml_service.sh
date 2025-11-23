#!/bin/bash

echo "========================================"
echo "Starting ML Detection Service (Flask)"
echo "========================================"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 tidak ditemukan!"
    echo "Silakan install Python 3.8+ terlebih dahulu"
    exit 1
fi

echo "[INFO] Python ditemukan"
python3 --version

echo ""
echo "[INFO] Memeriksa model..."
if [ ! -f "weights/best.pt" ]; then
    echo "[WARNING] Model weights/best.pt tidak ditemukan!"
    echo "Pastikan model sudah di-training terlebih dahulu"
    echo "Jalankan: python scripts/2_train_model.py"
    echo ""
fi

echo ""
echo "[INFO] Memeriksa dependencies..."
if ! python3 -c "import flask" &> /dev/null; then
    echo "[INFO] Menginstall dependencies..."
    pip3 install -r requirements_ml_api.txt
fi

echo ""
echo "========================================"
echo "Starting Flask ML Service on port 5000"
echo "========================================"
echo ""
echo "Service akan berjalan di: http://localhost:5000"
echo "Tekan CTRL+C untuk menghentikan service"
echo ""

python3 ml_api_service.py

