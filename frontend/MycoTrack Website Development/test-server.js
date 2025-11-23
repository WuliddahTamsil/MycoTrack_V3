// Simple test script to check if server is running
const http = require('http');

const testHealth = () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Backend is running!');
          console.log('Response:', data);
          resolve(data);
        } else {
          console.error('❌ Backend returned status:', res.statusCode);
          reject(new Error(`Status: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Cannot connect to backend:', error.message);
      console.error('Make sure backend is running: cd backend && npm start');
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Connection timeout'));
    });

    req.end();
  });
};

testHealth().catch(() => {
  process.exit(1);
});

