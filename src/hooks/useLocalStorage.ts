import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = window.localStorage.getItem(key);
    if (stored === null) return initialValue;
    try {
      const parsedStored: T = JSON.parse(stored);
      return parsedStored ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  const [hasStorageError, setStorageError] = useState(false);

  useEffect(() => {
    let hasError = false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      hasError = true;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Status depends on an external storage operation.
    setStorageError(hasError);
  }, [key, value]);

  return [value, setValue, hasStorageError] as const;
}
