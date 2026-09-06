import { POST as loginUser } from '../app/api/auth/login/route';
import { POST as demoSwitch } from '../app/api/auth/demo-switch/route';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../lib/auth';

async function testAuth() {
  console.log('🔒 Testing Enterprise Auth Engine...');

  // 1. Password hashing
  const rawPw = 'SuperSecret123!';
  const hashed = hashPassword(rawPw);
  const isValid = verifyPassword(rawPw, hashed);
  const isInvalid = verifyPassword('WrongPassword', hashed);
  if (!isValid || isInvalid) throw new Error('Password hash verification failed!');
  console.log('✓ Cryptographic password hashing and salting verified.');

  // 2. JWT token signing and verification
  const token = signToken({
    userId: 'usr_test_1',
    email: 'test@tripshield.ai',
    name: 'Test Executive',
    role: 'TRAVELER',
    tier: 'Diamond Shield VIP',
  });
  const decoded = verifyToken(token);
  if (!decoded || decoded.email !== 'test@tripshield.ai') throw new Error('JWT verification failed!');
  console.log('✓ Cryptographic JWT token signing & verification verified.');

  // 3. Test POST /api/auth/login
  const loginReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'alex.mercer@stratos-ai.com',
      password: 'Password123!',
    }),
  });
  const loginRes = await loginUser(loginReq);
  const loginData = await loginRes.json();
  if (!loginData.success || loginData.user.name !== 'Alex Mercer') {
    throw new Error('Login failed: ' + JSON.stringify(loginData));
  }
  console.log(`✓ Login API verified: Authenticated as ${loginData.user.name} (${loginData.user.tier}).`);

  // 4. Test POST /api/auth/demo-switch
  const switchReq = new Request('http://localhost:3000/api/auth/demo-switch', {
    method: 'POST',
    body: JSON.stringify({ email: 'elena.rostova@familytravel.io' }),
  });
  const switchRes = await demoSwitch(switchReq);
  const switchData = await switchRes.json();
  if (!switchData.success || switchData.user.name !== 'Elena Rostova') {
    throw new Error('Demo switch failed: ' + JSON.stringify(switchData));
  }
  console.log(`✓ 1-Click Demo Switch API verified: Switched to ${switchData.user.name}.`);

  console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED WITH 100% SUCCESS!');
}

testAuth().catch((err) => {
  console.error('❌ Auth test failed:', err);
  process.exit(1);
});
