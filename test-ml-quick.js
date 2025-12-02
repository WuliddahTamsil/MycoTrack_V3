#!/usr/bin/env node

/**
 * Quick test untuk ML service - test health check dengan timeout pendek
 */

const http = require('http');

function testMLService() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/health', { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: json
          });
        } catch (e) {
          resolve({
            success: false,
            error: 'Invalid JSON response',
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout (2 seconds) - ML service mungkin hang atau tidak merespons'
      });
    });
  });
}

async function main() {
  console.log('Testing ML Service (quick test)...');
  console.log('URL: http://localhost:5000/health');
  console.log('Timeout: 2 seconds\n');
  
  const result = await testMLService();
  
  if (result.success) {
    console.log('✅ ML Service is responding!');
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.data.model_loaded) {
      console.log('\n✅ Model is loaded and ready!');
    } else {
      console.log('\n⚠️  Model is still loading in background...');
      console.log('   This is OK - service will work once model is loaded.');
    }
  } else {
    console.log('❌ ML Service is NOT responding');
    console.log(`Error: ${result.error}`);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure ML service is running: npm run dev:ml');
    console.log('2. Check if port 5000 is available: npm run kill:5000');
    console.log('3. Check terminal output for ML service errors');
  }
}

main();

