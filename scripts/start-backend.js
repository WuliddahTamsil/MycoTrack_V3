#!/usr/bin/env node

/**
 * Script wrapper untuk menjalankan Backend Service
 * Cross-platform script untuk menjalankan backend server
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendPath = path.join(__dirname, '..', 'backend');
const serverScript = path.join(backendPath, 'server.js');

console.log('='.repeat(70));
console.log('Starting Backend Server (Node.js/Express)');
console.log('='.repeat(70));
console.log(`Path: ${backendPath}`);
console.log('='.repeat(70));
console.log('');

// Cek apakah file server.js ada
if (!fs.existsSync(serverScript)) {
  console.error(`[ERROR] File tidak ditemukan: ${serverScript}`);
  console.error('Pastikan folder "backend" ada dan berisi server.js');
  process.exit(1);
}

// Cek apakah node_modules ada
const nodeModulesPath = path.join(backendPath, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.warn('[WARNING] node_modules tidak ditemukan!');
  console.warn('[INFO] Install dependencies dengan: npm install --prefix backend');
  console.warn('[INFO] Atau: cd backend && npm install');
}

console.log('');

// Change directory ke backend folder
try {
  process.chdir(backendPath);
  console.log(`[INFO] Working directory: ${process.cwd()}`);
} catch (error) {
  console.error(`[ERROR] Tidak bisa masuk ke directory: ${error.message}`);
  process.exit(1);
}

console.log('');

// Jalankan Node.js script
console.log('[INFO] Menjalankan backend server...');
console.log('='.repeat(70));
console.log('');

// Gunakan path relatif dari server.js untuk memastikan working directory benar
const nodeProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: backendPath,
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3000'
  }
});

nodeProcess.on('error', (error) => {
  console.error('');
  console.error('='.repeat(70));
  console.error(`[ERROR] Gagal menjalankan backend server: ${error.message}`);
  console.error('='.repeat(70));
  console.error('');
  console.error('Troubleshooting:');
  console.error('1. Pastikan Node.js terinstall dan ada di PATH');
  console.error('2. Install dependencies: npm install --prefix backend');
  console.error('3. Cek apakah file server.js ada dan valid');
  console.error('4. Cek apakah port 3000 sudah digunakan');
  console.error('');
  process.exit(1);
});

nodeProcess.on('exit', (code, signal) => {
  if (code !== 0 && code !== null) {
    console.error('');
    console.error('='.repeat(70));
    console.error(`[ERROR] Backend server exited with code ${code}`);
    if (signal) {
      console.error(`[ERROR] Terminated by signal: ${signal}`);
    }
    console.error('='.repeat(70));
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Cek error di atas untuk detail');
    console.error('2. Pastikan port 3000 tidak digunakan aplikasi lain');
    console.error('3. Cek apakah database connection berhasil');
    console.error('4. Cek dependencies: npm install --prefix backend');
    console.error('');
    process.exit(code || 1);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n[INFO] Menghentikan backend server...');
  if (nodeProcess && !nodeProcess.killed) {
    nodeProcess.kill('SIGINT');
  }
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on('SIGTERM', () => {
  if (nodeProcess && !nodeProcess.killed) {
    nodeProcess.kill('SIGTERM');
  }
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('');
  console.error('[ERROR] Uncaught exception:', error.message);
  if (nodeProcess && !nodeProcess.killed) {
    nodeProcess.kill();
  }
  process.exit(1);
});

