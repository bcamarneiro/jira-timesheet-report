import React from 'react';
import type { PersonalConfig, TimeOffEntry } from '../../../types/PersonalConfig';

type TimeOffMap = Record<string, number>;

export function useTimeOff(user: string, personalConfig?: PersonalConfig) {
  const STORAGE_KEY = 'timeOff:v1';
  
  // Check if migration has been done
  const MIGRATION_KEY = 'timeOff:migrated';
  const [isMigrated, setIsMigrated] = React.useState(() => {
    return localStorage.getItem(MIGRATION_KEY) === 'true';
  });

  // Legacy localStorage state (for backward compatibility)
  const [timeOffMap, setTimeOffMap] = React.useState<TimeOffMap>(() => {
    if (isMigrated) return {} as TimeOffMap;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {} as TimeOffMap;
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === 'object' ? (parsed as TimeOffMap) : ({} as TimeOffMap);
    } catch {
      return {} as TimeOffMap;
    }
  });

  const keyFor = React.useCallback((iso: string) => `${user}::${iso}`, [user]);

  // Migrate legacy data to personal config if not already done
  React.useEffect(() => {
    if (!isMigrated && personalConfig && Object.keys(timeOffMap).length > 0) {
      const userEntries: TimeOffEntry[] = [];
      
      // Extract entries for this user
      Object.entries(timeOffMap).forEach(([key, hours]) => {
        if (key.startsWith(`${user}::`)) {
          const date = key.replace(`${user}::`, '');
          userEntries.push({
            date,
            hours,
            description: `Migrated from legacy storage`
          });
        }
      });

      // Add to personal config if there are entries
      if (userEntries.length > 0) {
        const updatedConfig = {
          ...personalConfig,
          timeOffEntries: [...personalConfig.timeOffEntries, ...userEntries]
        };
        
        // Save to localStorage
        localStorage.setItem('personalConfig', JSON.stringify(updatedConfig));
        
        // Mark as migrated and clear legacy data
        localStorage.setItem(MIGRATION_KEY, 'true');
        localStorage.removeItem(STORAGE_KEY);
        setIsMigrated(true);
        setTimeOffMap({});
        
        // Reload to pick up the new config
        window.location.reload();
      }
    }
  }, [isMigrated, personalConfig, timeOffMap, user]);

  const getTimeOffHours = React.useCallback(
    (iso: string): number => {
      // First check personal config
      if (personalConfig) {
        const entry = personalConfig.timeOffEntries.find(e => e.date === iso);
        if (entry) return entry.hours;
      }
      
      // Fallback to legacy storage
      return timeOffMap[keyFor(iso)] || 0;
    },
    [personalConfig, timeOffMap, keyFor]
  );

  const setTimeOffHours = React.useCallback(
    (iso: string, hours: number) => {
      // If we have personal config, we need to update it through the hook system
      // For now, we'll use a simple approach: update localStorage and reload
      if (personalConfig) {
        const updatedEntries = [...personalConfig.timeOffEntries];
        const existingIndex = updatedEntries.findIndex(e => e.date === iso);
        
        if (hours > 0) {
          const entry: TimeOffEntry = {
            date: iso,
            hours: Math.max(0, Math.min(8, hours)),
            description: `Time off for ${iso}`
          };
          
          if (existingIndex >= 0) {
            updatedEntries[existingIndex] = entry;
          } else {
            updatedEntries.push(entry);
          }
        } else {
          // Remove entry if hours is 0
          if (existingIndex >= 0) {
            updatedEntries.splice(existingIndex, 1);
          }
        }
        
        // Save to localStorage
        const updatedConfig = {
          ...personalConfig,
          timeOffEntries: updatedEntries
        };
        localStorage.setItem('personalConfig', JSON.stringify(updatedConfig));
        
        // Reload to pick up the changes
        window.location.reload();
        return;
      }
      
      // Fallback to legacy storage
      setTimeOffMap(prev => {
        const next = { ...prev } as TimeOffMap;
        const k = keyFor(iso);
        if (hours > 0) next[k] = Math.max(0, Math.min(8, hours)); else delete next[k];
        return next;
      });
    },
    [personalConfig, keyFor]
  );

  // Save legacy data to localStorage (only if not migrated)
  React.useEffect(() => {
    if (!isMigrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timeOffMap));
      } catch {}
    }
  }, [timeOffMap, isMigrated]);

  return { getTimeOffHours, setTimeOffHours };
}


