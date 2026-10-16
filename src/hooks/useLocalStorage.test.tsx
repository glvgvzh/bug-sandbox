import { describe, it, expect, afterEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';
import { renderHook } from '@testing-library/react';
import { seedItems } from '../data/seed';

describe('useLocalStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('возвращает начальное значение и не роняет приложение если JSON в localStorage поврежден', () => {
    const key = 'pantry-pilot:items';
    localStorage.setItem(key, 'broken-json');

    const { result } = renderHook(() => useLocalStorage(key, seedItems));
    expect(result.current[0]).toStrictEqual(seedItems);
  });
});
