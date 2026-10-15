import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInventory } from './useInventory';
import { renderHook } from '@testing-library/react';
import { seedItems } from '../data/seed';
import { act } from 'react';

describe('useInventory', () => {
  const fakeDate = new Date(2026, 9, 15, 12, 0, 0);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fakeDate);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('устанавливает нулевое количество редактируемому продукту', () => {
    const draft = { ...seedItems[0], quantity: 0 };
    localStorage.setItem('pantry-pilot:items', JSON.stringify(seedItems));
    const { result } = renderHook(() => useInventory());

    act(() => {
      result.current.updateItem('item-oats', draft);
    });

    expect(result.current.items[0]).toStrictEqual({ ...draft, updatedAt: fakeDate.toISOString() });
  });
});
