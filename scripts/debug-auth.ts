import { db } from '@/lib/db';
import { authenticateUser, hashPassword, verifyPassword } from '@/lib/auth';

async function debugAuth() {
  console.log('🔍 Debugging authentication...');
  
  try {
    // Check if any users exist
    const userCount = await db.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    // Get first user for testing
    const firstUser = await db.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        status: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      }
    });
    
    if (!firstUser) {
      console.log('❌ No users found');
      return;
    }
    
    console.log('👤 First user found:');
    console.log(`   Email: ${firstUser.email}`);
    console.log(`   Name: ${firstUser.name}`);
    console.log(`   Status: ${firstUser.status}`);
    console.log(`   Failed attempts: ${firstUser.failedLoginAttempts || 0}`);
    console.log(`   Locked until: ${firstUser.lockedUntil || 'Not locked'}`);
    console.log(`   Has password: ${firstUser.password ? 'Yes' : 'No'}`);
    
    if (!firstUser.password) {
      console.log('❌ User has no password set');
      return;
    }
    
    // Test password verification with a common test password
    const testPasswords = ['password', '123456', 'test123', 'admin', firstUser.email.split('@')[0]];
    
    console.log('\n🔐 Testing common passwords...');
    for (const testPassword of testPasswords) {
      const isValid = await verifyPassword(testPassword, firstUser.password);
      console.log(`   "${testPassword}": ${isValid ? '✅ MATCH' : '❌ No match'}`);
      
      if (isValid) {
        console.log(`\n🎉 Found working password: "${testPassword}"`);
        
        // Test full authentication
        const authResult = await authenticateUser(firstUser.email, testPassword);
        console.log(`   Full auth test: ${authResult ? '✅ SUCCESS' : '❌ FAILED'}`);
        break;
      }
    }
    
    // Test creating a new password hash
    console.log('\n🔧 Testing password hashing...');
    const testPassword = 'test123';
    const hashedTest = await hashPassword(testPassword);
    const verifyTest = await verifyPassword(testPassword, hashedTest);
    console.log(`   Hash/verify test: ${verifyTest ? '✅ SUCCESS' : '❌ FAILED'}`);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await db.$disconnect();
  }
}

debugAuth();
