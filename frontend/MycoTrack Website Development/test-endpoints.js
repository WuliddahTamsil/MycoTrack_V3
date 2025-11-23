// Test script untuk memastikan semua endpoint bekerja
const http = require('http');

const API_BASE = 'http://localhost:3000/api';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testing Backend Endpoints...\n');

  // Test 1: Health Check
  try {
    const health = await makeRequest('GET', '/api/health');
    console.log('✅ Health Check:', health.status === 200 ? 'PASS' : 'FAIL');
    console.log('   Response:', health.data);
  } catch (error) {
    console.log('❌ Health Check: FAIL');
    console.log('   Error:', error.message);
  }

  // Test 2: Customer Login (should fail - no users yet)
  try {
    const login = await makeRequest('POST', '/api/customer/login', {
      email: 'test@test.com',
      password: 'test123'
    });
    console.log('\n✅ Customer Login Endpoint:', login.status === 401 ? 'PASS (expected 401)' : 'CHECK');
    console.log('   Status:', login.status);
    console.log('   Response:', login.data);
  } catch (error) {
    console.log('\n❌ Customer Login: FAIL');
    console.log('   Error:', error.message);
  }

  // Test 3: Admin Login (should work with default admin)
  try {
    const adminLogin = await makeRequest('POST', '/api/admin/login', {
      email: 'adminmyc@gmail.com',
      password: '12345678'
    });
    console.log('\n✅ Admin Login:', adminLogin.status === 200 ? 'PASS' : 'FAIL');
    console.log('   Status:', adminLogin.status);
    console.log('   Response:', JSON.stringify(adminLogin.data, null, 2));
  } catch (error) {
    console.log('\n❌ Admin Login: FAIL');
    console.log('   Error:', error.message);
  }

  console.log('\n✨ Testing complete!');
}

testEndpoints().catch(console.error);

