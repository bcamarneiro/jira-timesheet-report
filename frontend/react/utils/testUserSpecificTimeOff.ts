import { useConfigStore } from '../stores/configStore';

/**
 * Test utility to verify user-specific time off functionality
 */
export const testUserSpecificTimeOff = () => {
  const store = useConfigStore.getState();
  
  console.log('🧪 Testing user-specific time off functionality...');
  
  // Log current state
  console.log('📊 Current time off entries:', store.personalConfig.timeOffEntries);
  
  // Add time off for user "Jorge Reyes"
  console.log('➕ Adding time off for Jorge Reyes...');
  store.addTimeOffEntry("Jorge Reyes", {
    date: "2025-08-15",
    hours: 8,
    description: "Vacation day for Jorge"
  });
  
  // Add time off for user "Alice Smith"
  console.log('➕ Adding time off for Alice Smith...');
  store.addTimeOffEntry("Alice Smith", {
    date: "2025-08-16",
    hours: 4,
    description: "Half day for Alice"
  });
  
  // Add another time off for Jorge Reyes
  console.log('➕ Adding another time off for Jorge Reyes...');
  store.addTimeOffEntry("Jorge Reyes", {
    date: "2025-08-20",
    hours: 6,
    description: "Sick day for Jorge"
  });
  
  // Wait a moment for persistence
  setTimeout(() => {
    console.log('✅ After adding time off:');
    console.log('📊 Updated time off entries:', store.personalConfig.timeOffEntries);
    
    // Test getting time off for specific users
    console.log('🔍 Jorge Reyes time off for 2025-08-15:', store.getTimeOffForDate("Jorge Reyes", "2025-08-15"));
    console.log('🔍 Jorge Reyes time off for 2025-08-20:', store.getTimeOffForDate("Jorge Reyes", "2025-08-20"));
    console.log('🔍 Alice Smith time off for 2025-08-16:', store.getTimeOffForDate("Alice Smith", "2025-08-16"));
    console.log('🔍 Alice Smith time off for 2025-08-15:', store.getTimeOffForDate("Alice Smith", "2025-08-15")); // Should be 0
    
    console.log('');
    console.log('🎯 To see this in the Personal Settings:');
    console.log('1. Go to Settings → Personal tab');
    console.log('2. Change the user to "Jorge Reyes" or "Alice Smith"');
    console.log('3. You should see their specific time off entries');
    console.log('');
    console.log('🧹 Run clearOldLocalStorage() to clean up test data when done');
  }, 100);
};

// Make it available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).testUserSpecificTimeOff = testUserSpecificTimeOff;
}
