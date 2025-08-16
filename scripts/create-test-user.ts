import { db } from '@/lib/db';
import { createUser } from '@/lib/auth';

async function createTestUser() {
  console.log('🔧 Creating test user for authentication testing...');

  const testEmail = 'test@example.com';
  const testPassword = 'test123';

  try {
    // Check if test user already exists
    const existingUser = await db.user.findUnique({
      where: { email: testEmail }
    });

    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      console.log('   You can use these credentials to test login');
      return;
    }

    // Create test user
    const user = await createUser({
      email: testEmail,
      name: 'Test User',
      password: testPassword,
    });

    if (user) {
      console.log('✅ Test user created successfully:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Referral Code: ${user.referralCode}`);
      console.log('');
      console.log('🎉 You can now test the authentication system:');
      console.log('   1. Start the dev server: bun dev');
      console.log('   2. Go to http://localhost:3000');
      console.log('   3. Login with the credentials above');
      console.log('   4. Test registration with a different email');
    } else {
      console.log('❌ Failed to create test user');
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await db.$disconnect();
  }
}

createTestUser();
