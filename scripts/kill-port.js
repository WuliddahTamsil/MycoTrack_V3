#!/usr/bin/env node

/**
 * Script untuk kill proses yang menggunakan port tertentu
 * Cross-platform script untuk Windows/Linux/Mac
 */

const { execSync } = require('child_process');
const os = require('os');

const port = process.argv[2] || '3000';

console.log(`Mencari proses yang menggunakan port ${port}...`);

try {
  const platform = os.platform();
  let command;
  let parseOutput;

  if (platform === 'win32') {
    // Windows
    command = `netstat -ano | findstr :${port}`;
    parseOutput = (output) => {
      const lines = output.split('\n').filter(line => line.trim());
      const pids = new Set();
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 0) {
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        }
      });
      return Array.from(pids);
    };
  } else {
    // Linux/Mac
    command = `lsof -ti :${port}`;
    parseOutput = (output) => {
      return output.trim().split('\n').filter(pid => pid && !isNaN(pid));
    };
  }

  const output = execSync(command, { encoding: 'utf-8' });
  const pids = parseOutput(output);

  if (pids.length === 0) {
    console.log(`✅ Port ${port} tidak digunakan oleh proses lain.`);
    process.exit(0);
  }

  console.log(`\nDitemukan ${pids.length} proses yang menggunakan port ${port}:`);
  pids.forEach(pid => console.log(`  - PID: ${pid}`));

  console.log(`\nMenghentikan proses...`);
  
  pids.forEach(pid => {
    try {
      if (platform === 'win32') {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      } else {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
      }
      console.log(`  ✅ Proses ${pid} dihentikan`);
    } catch (error) {
      console.log(`  ⚠️  Gagal menghentikan proses ${pid}: ${error.message}`);
    }
  });

  console.log(`\n✅ Port ${port} sekarang bebas.`);
} catch (error) {
  if (error.status === 1) {
    // No process found (exit code 1 is normal for findstr/lsof when nothing found)
    console.log(`✅ Port ${port} tidak digunakan oleh proses lain.`);
  } else {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

