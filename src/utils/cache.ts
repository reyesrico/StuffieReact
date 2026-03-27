/**
 * Simple localStorage cache utility for clearing old cache entries
 */

/**
 * Removes all cache entries (with optional prefix filter)
 * @param prefix - Optional prefix to filter which keys to clear
 */
export const clearAllCache = (prefix?: string): void => {
  try {
    // Use localStorage.key(i) for reliable enumeration  
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    
    // Filter by prefix if provided
    const keysToRemove = prefix 
      ? keys.filter(key => key.startsWith(prefix))
      : keys.filter(key => key.startsWith('cache_'));
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};
