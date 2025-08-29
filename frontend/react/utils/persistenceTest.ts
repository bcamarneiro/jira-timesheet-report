import { useConfigStore } from '../stores/configStore';

/**
 * Simple utility to test localStorage persistence
 */
export const testPersistence = () => {
  const store = useConfigStore.getState();
  
  console.log('🧪 Testing Zustand localStorage persistence...');
  
  // Log current state
  console.log('📊 Current state:', {
    projectConfig: store.projectConfig,
    personalConfig: store.personalConfig
  });
  
  // Check localStorage
  const stored = localStorage.getItem('jira-timesheet-config');
  console.log('💾 localStorage data:', stored ? JSON.parse(stored) : 'No data');
  
  // Make a test change
  console.log('➕ Adding test emoji mapping...');
  store.addEmojiMapping({
    ticketId: 'TEST-123',
    emoji: '🧪',
    description: 'Test emoji for persistence verification'
  });
  
  // Wait a moment for persistence to complete
  setTimeout(() => {
    console.log('✅ After change:');
    console.log('📊 Updated state:', {
      projectConfig: store.projectConfig,
      personalConfig: store.personalConfig
    });
    
    const updatedStorage = localStorage.getItem('jira-timesheet-config');
    console.log('💾 Updated localStorage:', updatedStorage ? JSON.parse(updatedStorage) : 'No data');
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    store.resetProjectConfig();
    
    console.log('✅ Persistence test completed!');
  }, 100);
};

// Make it available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).testPersistence = testPersistence;
}
