// Test script untuk test login dengan data yang ada
const http = require('http');

function testLogin(role, email, password) {
  return new Promise((resolve, reject) => {
    const endpoint = role === 'admin' ? '/api/admin/login' : 
                     role === 'customer' ? '/api/customer/login' : 
                     '/api/petani/login';
    
    const data = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
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

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Login Authentication...\n');

  // Test 1: Admin Login
  console.log('Test 1: Admin Login');
  try {
    const result = await testLogin('admin', 'adminmyc@gmail.com', '12345678');
    if (result.status === 200) {
      console.log('✅ Admin login: PASS');
      console.log('   User:', result.data.user?.email);
    } else {
      console.log('❌ Admin login: FAIL');
      console.log('   Status:', result.status);
      console.log('   Response:', result.data);
    }
  } catch (error) {
    console.log('❌ Admin login: ERROR');
    console.log('   Error:', error.message);
  }

  // Test 2: Customer Login (dari data yang ada)
  console.log('\nTest 2: Customer Login');
  try {
    const result = await testLogin('customer', 'wuliddahtamsilbarokah19@gmail.com', '12345678');
    if (result.status === 200) {
      console.log('✅ Customer login: PASS');
      console.log('   User:', result.data.user?.email);
    } else {
      console.log('❌ Customer login: FAIL');
      console.log('   Status:', result.status);
      console.log('   Response:', result.data);
    }
  } catch (error) {
    console.log('❌ Customer login: ERROR');
    console.log('   Error:', error.message);
  }

  console.log('\n✨ Testing complete!');
}

runTests().catch(console.error);

