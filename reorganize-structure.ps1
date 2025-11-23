# Script untuk merapihkan struktur folder MycoTrack
# Jalankan dengan: powershell -ExecutionPolicy Bypass -File reorganize-structure.ps1

Write-Host "=== Reorganisasi Struktur Folder MycoTrack ===" -ForegroundColor Cyan
Write-Host ""

# 1. Backend - Buat folder docs dan scripts
Write-Host "[1/6] Membuat folder docs dan scripts di backend..." -ForegroundColor Yellow
if (!(Test-Path "backend\docs")) { New-Item -ItemType Directory -Path "backend\docs" | Out-Null }
if (!(Test-Path "backend\scripts")) { New-Item -ItemType Directory -Path "backend\scripts" | Out-Null }
Write-Host "✓ Folder docs dan scripts dibuat" -ForegroundColor Green

# 2. Backend - Pindahkan dokumentasi ke docs/
Write-Host "[2/6] Memindahkan dokumentasi backend ke docs/..." -ForegroundColor Yellow
$backendDocs = @(
    "backend\API_DOCUMENTATION.md",
    "backend\COMPLETE_DOCUMENTATION.md",
    "backend\DATABASE_STRUCTURE.md",
    "backend\FARMER_PRODUCT_CUSTOMER_FLOW.md",
    "backend\FEATURE_FLOW.md",
    "backend\FORUM_FEATURE.md",
    "backend\QUICK_FIX.md",
    "backend\QUICK_START.md",
    "backend\README_BACKEND.md",
    "backend\START.md",
    "backend\TROUBLESHOOTING_ENDPOINT.md",
    "backend\TROUBLESHOOTING.md"
)

foreach ($doc in $backendDocs) {
    if (Test-Path $doc) {
        $fileName = Split-Path $doc -Leaf
        Move-Item -Path $doc -Destination "backend\docs\$fileName" -Force
        Write-Host "  ✓ $fileName" -ForegroundColor Gray
    }
}
Write-Host "✓ Dokumentasi dipindahkan" -ForegroundColor Green

# 3. Backend - Pindahkan script files ke scripts/
Write-Host "[3/6] Memindahkan script files ke scripts/..." -ForegroundColor Yellow
$backendScripts = @(
    "backend\test-endpoints.js",
    "backend\test-login.js",
    "backend\test-server.js",
    "backend\START_BACKEND.bat",
    "backend\START_BACKEND.ps1",
    "backend\RESTART_BACKEND.bat"
)

foreach ($script in $backendScripts) {
    if (Test-Path $script) {
        $fileName = Split-Path $script -Leaf
        Move-Item -Path $script -Destination "backend\scripts\$fileName" -Force
        Write-Host "  ✓ $fileName" -ForegroundColor Gray
    }
}
Write-Host "✓ Script files dipindahkan" -ForegroundColor Green

# 4. Backend - Hapus folder frontend yang tidak perlu
Write-Host "[4/6] Menghapus folder frontend di backend..." -ForegroundColor Yellow
if (Test-Path "backend\frontend") {
    Remove-Item -Path "backend\frontend" -Recurse -Force
    Write-Host "✓ Folder frontend di backend dihapus" -ForegroundColor Green
} else {
    Write-Host "✓ Folder frontend tidak ditemukan (sudah bersih)" -ForegroundColor Gray
}

# 5. Frontend - Hapus folder frontend yang duplikat
Write-Host "[5/6] Menghapus folder frontend duplikat..." -ForegroundColor Yellow
if (Test-Path "frontend\MycoTrack Website Development\frontend") {
    Remove-Item -Path "frontend\MycoTrack Website Development\frontend" -Recurse -Force
    Write-Host "✓ Folder frontend duplikat dihapus" -ForegroundColor Green
} else {
    Write-Host "✓ Folder frontend duplikat tidak ditemukan (sudah bersih)" -ForegroundColor Gray
}

# 6. Frontend - Pindahkan dokumentasi dan hapus file backend
Write-Host "[6/6] Merapihkan frontend..." -ForegroundColor Yellow
$frontendPath = "frontend\MycoTrack Website Development"

# Buat folder docs di frontend
if (!(Test-Path "$frontendPath\docs")) { 
    New-Item -ItemType Directory -Path "$frontendPath\docs" | Out-Null 
}

# Pindahkan dokumentasi
$frontendDocs = @(
    "$frontendPath\API_DOCUMENTATION.md",
    "$frontendPath\COMPLETE_DOCUMENTATION.md",
    "$frontendPath\DATABASE_STRUCTURE.md",
    "$frontendPath\FARMER_PRODUCT_CUSTOMER_FLOW.md",
    "$frontendPath\FEATURE_FLOW.md",
    "$frontendPath\FORUM_FEATURE.md",
    "$frontendPath\QUICK_FIX.md",
    "$frontendPath\QUICK_START.md",
    "$frontendPath\README_BACKEND.md",
    "$frontendPath\START.md",
    "$frontendPath\TROUBLESHOOTING_ENDPOINT.md",
    "$frontendPath\TROUBLESHOOTING.md"
)

foreach ($doc in $frontendDocs) {
    if (Test-Path $doc) {
        $fileName = Split-Path $doc -Leaf
        Move-Item -Path $doc -Destination "$frontendPath\docs\$fileName" -Force
        Write-Host "  ✓ $fileName" -ForegroundColor Gray
    }
}

# Hapus file backend yang tidak perlu
$backendFilesToRemove = @(
    "$frontendPath\server.js",
    "$frontendPath\test-endpoints.js",
    "$frontendPath\test-login.js",
    "$frontendPath\test-server.js",
    "$frontendPath\START_BACKEND.bat",
    "$frontendPath\START_BACKEND.ps1",
    "$frontendPath\RESTART_BACKEND.bat"
)

foreach ($file in $backendFilesToRemove) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "  ✓ Dihapus: $(Split-Path $file -Leaf)" -ForegroundColor Gray
    }
}

# Hapus folder data di frontend (seharusnya hanya di backend)
if (Test-Path "$frontendPath\data") {
    Remove-Item -Path "$frontendPath\data" -Recurse -Force
    Write-Host "  ✓ Folder data di frontend dihapus" -ForegroundColor Gray
}

Write-Host "✓ Frontend dirapihkan" -ForegroundColor Green

Write-Host ""
Write-Host "=== Reorganisasi Selesai ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Struktur folder telah dirapihkan!" -ForegroundColor Green
Write-Host "Silakan cek folder backend\docs, backend\scripts, dan frontend\docs" -ForegroundColor Yellow
Write-Host ""

