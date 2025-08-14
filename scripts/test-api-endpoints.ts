// Simple test script to verify API endpoints work
async function testAPIEndpoints() {
  const BASE_URL = 'http://127.0.0.1:3000';
  
  console.log('🧪 Testing API Endpoints After Security Updates\n');

  try {
    // Test 1: Login
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
      })
    });

    console.log(`   Login status: ${loginResponse.status}`);
    
    if (loginResponse.status !== 200) {
      const errorData = await loginResponse.json();
      console.log(`   Login error: ${JSON.stringify(errorData)}`);
      return;
    }

    const loginData = await loginResponse.json();
    console.log(`   Login success: ${loginData.success ? '✅' : '❌'}`);

    // Extract cookies
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log(`   Set-Cookie header: ${setCookieHeader ? 'Present' : 'Missing'}`);

    if (!setCookieHeader) {
      console.log('   ❌ No cookies set in login response');
      return;
    }

    // Parse cookies
    const cookies = setCookieHeader.split(',').map(cookie => cookie.trim());
    const authTokenCookie = cookies.find(cookie => cookie.startsWith('auth-token='));
    
    if (!authTokenCookie) {
      console.log('   ❌ No auth-token cookie found');
      return;
    }

    const authToken = authTokenCookie.split('=')[1].split(';')[0];
    console.log(`   Auth token extracted: ${authToken.substring(0, 20)}...`);

    // Test 2: /api/auth/me
    console.log('\n2. Testing /api/auth/me...');
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Cookie': `auth-token=${authToken}`
      }
    });

    console.log(`   /me status: ${meResponse.status}`);
    
    if (meResponse.status === 200) {
      const meData = await meResponse.json();
      console.log(`   /me success: ${meData.success ? '✅' : '❌'}`);
      if (meData.user) {
        console.log(`   User: ${meData.user.name} (${meData.user.email})`);
      }
    } else {
      const errorData = await meResponse.json();
      console.log(`   /me error: ${JSON.stringify(errorData)}`);
    }

    // Test 3: /api/dashboard
    console.log('\n3. Testing /api/dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: {
        'Cookie': `auth-token=${authToken}`
      }
    });

    console.log(`   Dashboard status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.status === 200) {
      const dashboardData = await dashboardResponse.json();
      console.log(`   Dashboard success: ✅`);
      console.log(`   User wallet: $${dashboardData.user?.walletBalance || 0}`);
      console.log(`   Videos watched today: ${dashboardData.todayProgress?.videosWatched || 0}`);
    } else {
      const errorData = await dashboardResponse.json();
      console.log(`   Dashboard error: ${JSON.stringify(errorData)}`);
    }

    // Test 4: Test without token
    console.log('\n4. Testing endpoints without token...');
    const noTokenResponse = await fetch(`${BASE_URL}/api/auth/me`);
    console.log(`   No token /me status: ${noTokenResponse.status} ${noTokenResponse.status === 401 ? '✅' : '❌'}`);

    const noTokenDashboard = await fetch(`${BASE_URL}/api/dashboard`);
    console.log(`   No token dashboard status: ${noTokenDashboard.status} ${noTokenDashboard.status === 401 ? '✅' : '❌'}`);

    console.log('\n🎉 API endpoint testing completed!');

  } catch (error) {
    console.error('❌ Error testing API endpoints:', error);
  }
}

// Run the test
testAPIEndpoints();
