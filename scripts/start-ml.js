#!/usr/bin/env node

/**
 * Script wrapper untuk menjalankan ML Service (Python Flask)
 * Cross-platform script untuk menjalankan ml_api_service.py
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const mlProjectPath = path.join(__dirname, '..', 'machine learning', 'Project');
const mlServiceScript = path.join(mlProjectPath, 'ml_api_service.py');

console.log('='.repeat(70));
console.log('Starting ML Detection Service (Python Flask)');
console.log('='.repeat(70));
console.log(`Path: ${mlProjectPath}`);
console.log('='.repeat(70));
console.log('');

// Cek apakah file ml_api_service.py ada
if (!fs.existsSync(mlServiceScript)) {
  console.error(`[ERROR] File tidak ditemukan: ${mlServiceScript}`);
  console.error('Pastikan folder "machine learning/Project" ada dan berisi ml_api_service.py');
  process.exit(1);
}

// Deteksi Python command (python atau python3)
const pythonCommands = ['python', 'python3'];
let pythonCmd = null;

// Cek Python tersedia
for (const cmd of pythonCommands) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    pythonCmd = cmd;
    break;
  } catch (e) {
    // Python command tidak tersedia, coba yang berikutnya
  }
}

if (!pythonCmd) {
  console.error('[ERROR] Python tidak ditemukan!');
  console.error('Silakan install Python 3.8+ terlebih dahulu');
  console.error('Download dari: https://www.python.org/downloads/');
  process.exit(1);
}

// Tampilkan versi Python
try {
  const pythonVersion = execSync(`${pythonCmd} --version`, { encoding: 'utf-8' });
  console.log(`[INFO] Menggunakan Python: ${pythonCmd} (${pythonVersion.trim()})`);
} catch (e) {
  console.log(`[INFO] Menggunakan Python: ${pythonCmd}`);
}

console.log('');

// Cek apakah dependencies terinstall (flask minimal)
try {
  execSync(`${pythonCmd} -c "import flask"`, { stdio: 'ignore', cwd: mlProjectPath });
  console.log('[INFO] Dependencies Python terdeteksi (Flask OK)');
} catch (e) {
  console.warn('[WARNING] Flask tidak terdeteksi. ML service mungkin gagal start.');
  console.warn('[INFO] Install dengan: pip install flask flask-cors');
}

// Cek apakah model file ada (optional, tapi bagus untuk warning)
const modelPath = path.join(mlProjectPath, 'weights', 'best.pt');
if (!fs.existsSync(modelPath)) {
  console.warn('[WARNING] Model file tidak ditemukan: weights/best.pt');
  console.warn('[INFO] ML service akan start tapi detection mungkin gagal');
  console.warn('[INFO] Train model dengan: python scripts/2_train_model.py');
} else {
  console.log('[INFO] Model file ditemukan: weights/best.pt');
}

console.log('');

// Change directory ke ML project folder
try {
  process.chdir(mlProjectPath);
  console.log(`[INFO] Working directory: ${process.cwd()}`);
} catch (error) {
  console.error(`[ERROR] Tidak bisa masuk ke directory: ${error.message}`);
  process.exit(1);
}

console.log('');

// Jalankan Python script
console.log('[INFO] Menjalankan ML service...');
console.log('='.repeat(70));
console.log('');

// Gunakan path relatif untuk memastikan working directory benar
const pythonProcess = spawn(pythonCmd, ['ml_api_service.py'], {
  stdio: 'inherit',
  shell: true,
  cwd: mlProjectPath,
  env: {
    ...process.env,
    PYTHONUNBUFFERED: '1', // Untuk output real-time
    PYTHONIOENCODING: 'utf-8', // Untuk encoding yang benar
    PYTHONLEGACYWINDOWSSTDIO: '0' // Untuk Windows console encoding
  }
});

pythonProcess.on('error', (error) => {
  console.error('');
  console.error('='.repeat(70));
  console.error(`[ERROR] Gagal menjalankan ML service: ${error.message}`);
  console.error('='.repeat(70));
  console.error('');
  console.error('Troubleshooting:');
  console.error('1. Pastikan Python terinstall dan ada di PATH');
  console.error('2. Install dependencies: pip install -r requirements_ml_api.txt');
  console.error('3. Cek apakah file ml_api_service.py ada dan valid');
  console.error('');
  process.exit(1);
});

pythonProcess.on('exit', (code, signal) => {
  if (code !== 0 && code !== null) {
    console.error('');
    console.error('='.repeat(70));
    console.error(`[ERROR] ML service exited with code ${code}`);
    if (signal) {
      console.error(`[ERROR] Terminated by signal: ${signal}`);
    }
    console.error('='.repeat(70));
    console.error('');
    process.exit(code || 1);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n[INFO] Menghentikan ML service...');
  if (pythonProcess && !pythonProcess.killed) {
    pythonProcess.kill('SIGINT');
  }
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on('SIGTERM', () => {
  if (pythonProcess && !pythonProcess.killed) {
    pythonProcess.kill('SIGTERM');
  }
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('');
  console.error('[ERROR] Uncaught exception:', error.message);
  if (pythonProcess && !pythonProcess.killed) {
    pythonProcess.kill();
  }
  process.exit(1);
});

