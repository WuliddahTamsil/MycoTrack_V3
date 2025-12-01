#!/usr/bin/env node

/**
 * Script untuk test apakah semua service berjalan dengan benar
 */

const http = require('http');

const services = [
  { name: 'Backend', url: 'http://localhost:3000/api/health', port: 3000 },
  { name: 'ML Service', url: 'http://localhost:5000/health', port: 5000 },
  { name: 'Frontend', url: 'http://localhost:5173', port: 5173 }
];

async function testService(service) {
  return new Promise((resolve) => {
    const req = http.get(service.url, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          name: service.name,
          port: service.port
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        name: service.name,
        port: service.port
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout',
        name: service.name,
        port: service.port
      });
    });
  });
}

async function testAllServices() {
  console.log('='.repeat(70));
  console.log('Testing All Services');
  console.log('='.repeat(70));
  console.log('');

  const results = await Promise.all(services.map(testService));

  let allSuccess = true;

  results.forEach((result) => {
    if (result.success) {
      console.log(`✅ ${result.name} (port ${result.port}): OK - Status ${result.status}`);
    } else {
      console.log(`❌ ${result.name} (port ${result.port}): FAILED - ${result.error}`);
      allSuccess = false;
    }
  });

  console.log('');
  console.log('='.repeat(70));

  if (allSuccess) {
    console.log('✅ All services are running correctly!');
    process.exit(0);
  } else {
    console.log('❌ Some services are not running. Please check the errors above.');
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Make sure all services are started: npm run dev:all');
    console.log('2. Check if ports are available: npm run kill:3000, npm run kill:5000, npm run kill:5173');
    console.log('3. Check terminal output for errors');
    process.exit(1);
  }
}

testAllServices();

