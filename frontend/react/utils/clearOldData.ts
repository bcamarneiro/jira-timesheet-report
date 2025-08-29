/**
 * Utility to clear old localStorage entries that are no longer needed
 * after migrating to Zustand
 */
export const clearOldLocalStorage = () => {
  const oldKeys = [
    'timeOff:v1',
    'timeOff:migrated',
    'timetracking_project_config',
    'timetracking_personal_config'
  ];

  console.log('🧹 Clearing old localStorage entries...');
  
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Removed: ${key}`);
    } else {
      console.log(`ℹ️  Not found: ${key}`);
    }
  });

  console.log('✅ Old localStorage entries cleared!');
  console.log('📊 Current localStorage keys:', Object.keys(localStorage));
};

// Make it available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).clearOldLocalStorage = clearOldLocalStorage;
}
