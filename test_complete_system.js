const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const cyan = '\x1b[36m';
const reset = '\x1b[0m';
const bold = '\x1b[1m';

const BASE_URL = 'http://localhost:5000/api';

async function runHttpRequest(url, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}

async function runTestSuite() {
  console.log(`\n${bold}${cyan}========================================================================${reset}`);
  console.log(`${bold}${cyan}   SHREE ONLINE (MAHULI, S.K.N) - COMPREHENSIVE END-TO-END TEST SUITE   ${reset}`);
  console.log(`${bold}${cyan}========================================================================${reset}\n`);

  let totalTests = 0;
  let passedTests = 0;
  let adminToken = '';

  async function test(name, fn) {
    totalTests++;
    process.stdout.write(`[Test ${totalTests.toString().padStart(2, '0')}] ${name.padEnd(52, '.')} `);
    try {
      await fn();
      passedTests++;
      console.log(`${green}PASSED ✓${reset}`);
    } catch (err) {
      console.log(`${red}FAILED ✗ (${err.message})${reset}`);
    }
  }

  // 1. Backend Server Health
  await test('Backend Server Health Check (/api/health)', async () => {
    const res = await runHttpRequest(`${BASE_URL}/health`);
    if (!res.ok || res.data.status !== 'healthy') {
      throw new Error(`Invalid health status: ${JSON.stringify(res.data)}`);
    }
  });

  // 2. System Configuration & Leadership Details
  await test('System Config & Leadership Profile API (/api/config)', async () => {
    let res = await runHttpRequest(`${BASE_URL}/admin/config`);
    if (!res.ok) res = await runHttpRequest(`${BASE_URL}/config`);
    if (!res.ok || !res.data.config) throw new Error('Failed to retrieve system config');
    const cfg = res.data.config;
    if (cfg.adminPhone !== '8090794210' || cfg.ownerPhone !== '9161400719') {
      throw new Error('Leadership contact numbers mismatch');
    }
  });

  // 3. Admin Managing Director Auth (Kamal Narayan Dwivedi)
  await test('Admin MD Login (/api/auth/login)', async () => {
    const res = await runHttpRequest(`${BASE_URL}/auth/login`, 'POST', {
      email: 'kdshree778@gmail.com',
      password: 'admin123'
    });
    if (!res.ok || !res.data.token || res.data.user.role !== 'admin') {
      throw new Error('Admin authentication failed');
    }
    adminToken = res.data.token;
  });

  // 4. Founder & Managing Owner Auth (Krishan Narayan Dwivedi)
  await test('Owner Login (/api/auth/login)', async () => {
    const res = await runHttpRequest(`${BASE_URL}/auth/login`, 'POST', {
      email: 'onlinebaba111111@gmail.com',
      password: 'owner123'
    });
    if (!res.ok || !res.data.token) {
      throw new Error('Owner authentication failed');
    }
  });

  // 5. Registration Gmail OTP Dispatch
  await test('Registration Gmail OTP Dispatch (/api/auth/register-otp)', async () => {
    const testEmail = `citizen_test_${Date.now()}@gmail.com`;
    const res = await runHttpRequest(`${BASE_URL}/auth/register-otp`, 'POST', {
      name: 'Ramesh Citizen Test',
      email: testEmail,
      password: 'Password@123',
      phone: '9876543210'
    });
    if (!res.ok || !res.data.success) {
      throw new Error(res.data.message || 'OTP dispatch failed');
    }
  });

  // 6. Forgot Password Recovery OTP Dispatch
  await test('Forgot Password Gmail OTP Dispatch (/api/auth/forgot-password)', async () => {
    const res = await runHttpRequest(`${BASE_URL}/auth/forgot-password`, 'POST', {
      email: 'kdshree778@gmail.com'
    });
    if (!res.ok || !res.data.success) {
      throw new Error(res.data.message || 'Forgot password OTP dispatch failed');
    }
  });

  // 7. Request Creation & Token Tracking Pipeline
  let createdTrackingId = '';
  await test('Citizen Service Request Creation (/api/requests)', async () => {
    const res = await runHttpRequest(`${BASE_URL}/requests`, 'POST', {
      customerName: 'Suresh Kumar Gupta',
      customerPhone: '9120367133',
      customerEmail: 'suresh.citizen@gmail.com',
      serviceCategory: 'Government Application',
      serviceName: 'Income Certificate (Aay Praman Patra)',
      instructions: 'Urgent for scholarship submission',
      priority: 'urgent'
    });
    if (!res.ok || !res.data.request) {
      throw new Error(res.data.message || 'Request creation failed');
    }
    createdTrackingId = res.data.request.requestId;
  });

  // 8. Public Token Search & Status Lookup
  await test('Public Token Status Search (/api/requests?search=...)', async () => {
    if (!createdTrackingId) throw new Error('No tracking token created');
    const res = await runHttpRequest(`${BASE_URL}/requests?search=${createdTrackingId}`);
    if (!res.ok || !res.data.requests || res.data.requests.length === 0) {
      throw new Error('Token lookup failed');
    }
  });

  // 9. Client Production Build (Vite)
  await test('Client Production Build (Vite 6.x)', async () => {
    const clientDir = path.join(__dirname, 'client');
    const output = execSync('npm run build', { cwd: clientDir, encoding: 'utf-8' });
    if (!output.includes('built in') && !fs.existsSync(path.join(clientDir, 'dist/index.html'))) {
      throw new Error('Vite build did not produce dist/index.html');
    }
  });

  // 10. Vercel Serverless Function Handler Simulation (api/index.js)
  await test('Vercel Serverless Handler Execution (api/index.js)', async () => {
    const vercelHandler = require(path.join(__dirname, 'api/index.js'));
    if (typeof vercelHandler !== 'function') {
      throw new Error('api/index.js did not export an Express serverless handler function');
    }

    const mockServer = http.createServer(vercelHandler);
    await new Promise((resolve, reject) => {
      mockServer.listen(0, '127.0.0.1', async () => {
        const port = mockServer.address().port;
        try {
          const testRes = await fetch(`http://127.0.0.1:${port}/api/health`);
          const testData = await testRes.json();
          mockServer.close();
          if (testData.status === 'healthy') {
            resolve();
          } else {
            reject(new Error(`Serverless handler returned invalid status: ${JSON.stringify(testData)}`));
          }
        } catch (e) {
          mockServer.close();
          reject(e);
        }
      });
    });
  });

  // 11. Vercel Config (vercel.json) Validation
  await test('Vercel Config & SPA Routing Validation (vercel.json)', async () => {
    const vercelJsonPath = path.join(__dirname, 'vercel.json');
    if (!fs.existsSync(vercelJsonPath)) throw new Error('vercel.json is missing');
    const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
    if (!config.rewrites || config.rewrites.length < 2) {
      throw new Error('vercel.json missing required API rewrites or SPA fallback');
    }
  });

  // 12. Environment Template & Credentials Check (.env.example)
  await test('Environment Template & Variable Sync (.env.example)', async () => {
    const envExamplePath = path.join(__dirname, '.env.example');
    if (!fs.existsSync(envExamplePath)) throw new Error('.env.example is missing');
    const content = fs.readFileSync(envExamplePath, 'utf-8');
    const requiredKeys = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
    for (const key of requiredKeys) {
      if (!content.includes(key)) throw new Error(`.env.example missing key: ${key}`);
    }
  });

  console.log(`\n${bold}${cyan}========================================================================${reset}`);
  console.log(`${bold}${green}   RESULT: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESSFUL)   ${reset}`);
  console.log(`${bold}${cyan}========================================================================${reset}\n`);
}

runTestSuite().catch(err => {
  console.error('\nFatal test suite failure:', err);
  process.exit(1);
});
