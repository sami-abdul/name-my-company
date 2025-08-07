// User History Endpoint Test Suite
// Tests the GET /api/domains/history endpoint functionality

import { config } from 'dotenv';

// Load environment variables FIRST before any other imports
config();

import { createUser, getUserByEmail, createGenerationSession, saveDomainSuggestions, getUserSessions, supabase } from '../src/config/supabase';

console.log('🧪 Starting User History Endpoint Tests...\n');

interface TestUser {
  id: string;
  email: string;
  name: string;
}

interface TestSession {
  id: string;
  user_id: string;
  prompt: string;
  model_used: string;
  created_at: string;
}

// Test data
const testUserEmail = `history-test-${Date.now()}@example.com`;
const testUserName = 'History Test User';
const testPrompts = [
  'AI startup for healthcare',
  'E-commerce platform for books',
  'Social media app for artists',
  'Fintech for small businesses'
];

const testDomains = [
  ['healthai', 'medicore', 'vitaltech', 'carebot', 'healx'],
  ['bookmart', 'readhub', 'bibliotech', 'pageflow', 'textlink'],
  ['artspace', 'creativelink', 'designhub', 'visualnet', 'craftcore'],
  ['paycore', 'fintech', 'bizpay', 'startupbank', 'smallpay']
];

async function setupTestData(): Promise<{ user: TestUser; sessions: TestSession[] }> {
  console.log('📋 Setting up test data...');
  
  try {
    // Create test user
    const user = await createUser(testUserEmail, testUserName);
    console.log('✅ Test user created:', { id: user.id, email: user.email });
    
    // Create multiple generation sessions
    const sessions: TestSession[] = [];
    for (let i = 0; i < testPrompts.length; i++) {
      const prompt = testPrompts[i];
      const domains = testDomains[i];
      
      if (!prompt || !domains) {
        throw new Error(`Missing test data at index ${i}`);
      }
      
      const session = await createGenerationSession(
        user.id, 
        prompt, 
        i % 2 === 0 ? 'gpt-4o-mini' : 'llama-3-70b'
      );
      sessions.push(session);
      
      // Save domain suggestions for each session
      await saveDomainSuggestions(session.id, domains);
      
      console.log(`✅ Session ${i + 1} created with ${domains.length} domains`);
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { user, sessions };
  } catch (error) {
    console.error('❌ Test data setup failed:', error);
    throw error;
  }
}

async function testGetUserSessions(userId: string) {
  console.log('\n🔍 Testing getUserSessions function...');
  
  try {
    // Test 1: Basic functionality
    const sessions = await getUserSessions(userId);
    console.log(`✅ Retrieved ${sessions.length} sessions for user`);
    
    if (sessions.length === 0) {
      throw new Error('No sessions returned');
    }
    
    // Test 2: Check session structure
    const session = sessions[0];
    const requiredFields = ['id', 'user_id', 'prompt', 'model_used', 'created_at'];
    for (const field of requiredFields) {
      if (!(field in session)) {
        throw new Error(`Missing field in session: ${field}`);
      }
    }
    console.log('✅ Session structure validation passed');
    
    // Test 3: Check domain suggestions are included
    if (!session.domain_suggestions || !Array.isArray(session.domain_suggestions)) {
      throw new Error('Domain suggestions not properly included');
    }
    console.log(`✅ Domain suggestions included: ${session.domain_suggestions.length} domains`);
    
    // Test 4: Test pagination
    const limitedSessions = await getUserSessions(userId, 2);
    if (limitedSessions.length > 2) {
      throw new Error('Limit parameter not working');
    }
    console.log('✅ Pagination limit working');
    
    // Test 5: Test offset
    const offsetSessions = await getUserSessions(userId, 2, 1);
    if (offsetSessions.length > 0 && offsetSessions[0].id === sessions[0].id) {
      throw new Error('Offset parameter not working');
    }
    console.log('✅ Pagination offset working');
    
    // Test 6: Test ordering (should be newest first)
    if (sessions.length > 1) {
      const firstDate = new Date(sessions[0].created_at);
      const secondDate = new Date(sessions[1].created_at);
      if (firstDate < secondDate) {
        throw new Error('Sessions not ordered by newest first');
      }
      console.log('✅ Sessions properly ordered by newest first');
    }
    
    return sessions;
  } catch (error) {
    console.error('❌ getUserSessions test failed:', error);
    throw error;
  }
}

async function testValidationAndErrorHandling(userId: string) {
  console.log('\n🛡️ Testing validation and error handling...');
  
  try {
    // Test 1: Invalid user ID
    try {
      await getUserSessions('');
      throw new Error('Should have failed with empty user ID');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid user ID')) {
        console.log('✅ Empty user ID validation working');
      } else {
        throw error;
      }
    }
    
    // Test 2: Invalid limit
    try {
      await getUserSessions(userId, 0);
      throw new Error('Should have failed with invalid limit');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Limit must be between')) {
        console.log('✅ Invalid limit validation working');
      } else {
        throw error;
      }
    }
    
    // Test 3: Invalid offset
    try {
      await getUserSessions(userId, 10, -1);
      throw new Error('Should have failed with negative offset');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Offset must be non-negative')) {
        console.log('✅ Negative offset validation working');
      } else {
        throw error;
      }
    }
    
    // Test 4: Non-existent user
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';
    const emptySessions = await getUserSessions(nonExistentUserId);
    if (emptySessions.length !== 0) {
      throw new Error('Should return empty array for non-existent user');
    }
    console.log('✅ Non-existent user handling working');
    
  } catch (error) {
    console.error('❌ Validation test failed:', error);
    throw error;
  }
}

async function testHistoryEndpointSimulation(user: TestUser) {
  console.log('\n🌐 Simulating HTTP endpoint behavior...');
  
  try {
    // Simulate the controller logic without HTTP server
    const limit = 10;
    const offset = 0;
    
    // Get user sessions
    const sessions = await getUserSessions(user.id, limit, offset);
    
    // Calculate stats (as done in the controller)
    const totalSessions = sessions.length;
    const totalDomains = sessions.reduce((sum, session) => 
      sum + (session.domain_suggestions?.length || 0), 0
    );
    
    // Create response object (as done in the controller)
    const response = {
      status: 'success',
      data: {
        sessions,
        pagination: {
          limit,
          offset,
          total_sessions: totalSessions,
          total_domains: totalDomains
        }
      }
    };
    
    console.log('✅ Response structure created successfully');
    console.log(`   📊 Total sessions: ${totalSessions}`);
    console.log(`   📊 Total domains: ${totalDomains}`);
    
    // Validate response structure
    if (response.status !== 'success') {
      throw new Error('Invalid response status');
    }
    
    if (!response.data || !response.data.sessions || !response.data.pagination) {
      throw new Error('Invalid response data structure');
    }
    
    if (response.data.pagination.total_sessions !== totalSessions) {
      throw new Error('Pagination stats incorrect');
    }
    
    console.log('✅ Endpoint simulation successful');
    return response;
    
  } catch (error) {
    console.error('❌ Endpoint simulation failed:', error);
    throw error;
  }
}

async function cleanupTestData(userEmail: string) {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Get user
    const user = await getUserByEmail(userEmail);
    if (!user) {
      console.log('✅ No test user found to clean up');
      return;
    }
    
    // Delete user (cascade will delete sessions and domain suggestions)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);
    
    if (error) {
      console.error('⚠️ Cleanup warning:', error);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
  } catch (error) {
    console.error('⚠️ Cleanup failed (non-critical):', error);
  }
}

async function runAllTests() {
  let testData: { user: TestUser; sessions: TestSession[] } | null = null;
  
  try {
    // Setup
    testData = await setupTestData();
    
    // Run tests
    await testGetUserSessions(testData.user.id);
    await testValidationAndErrorHandling(testData.user.id);
    await testHistoryEndpointSimulation(testData.user);
    
    console.log('\n🎉 All User History Endpoint tests passed!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (testData) {
      await cleanupTestData(testData.user.email);
    }
  }
}

// Run the tests
runAllTests();
