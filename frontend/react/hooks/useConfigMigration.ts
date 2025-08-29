import { useEffect, useState } from 'react';
import { useConfigStore } from '../stores/configStore';
import { migrateToZustand, isMigrationCompleted, markMigrationCompleted, cleanupOldStorage } from '../stores/migration';

/**
 * Hook that handles migration from old localStorage to Zustand store
 * and provides access to the configuration store
 */
export function useConfigMigration() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  
  const configStore = useConfigStore();

  useEffect(() => {
    const performMigration = async () => {
      // Check if migration is already completed
      if (isMigrationCompleted()) {
        setMigrationCompleted(true);
        return;
      }

      setIsMigrating(true);
      
      try {
        // Perform migration
        const success = migrateToZustand();
        
        if (success) {
          // Mark migration as completed
          markMigrationCompleted();
          setMigrationCompleted(true);
          
          // Clean up old storage after a delay to ensure everything is working
          setTimeout(() => {
            cleanupOldStorage();
          }, 1000);
        }
      } catch (error) {
        console.error('Migration failed:', error);
      } finally {
        setIsMigrating(false);
      }
    };

    performMigration();
  }, []);

  return {
    ...configStore,
    isMigrating,
    migrationCompleted,
  };
}
