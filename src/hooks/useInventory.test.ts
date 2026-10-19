import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInventory } from './useInventory';
import { renderHook } from '@testing-library/react';
import { seedItems } from '../data/seed';
import { act } from 'react';
import { removePantryItem, syncPantry } from '../services/pantryApi';

vi.mock('../services/pantryApi', () => ({
  removePantryItem: vi.fn(),
  syncPantry: vi.fn(),
}));

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

  it('ошибка удаления не отменяет более поздние изменения', async () => {
    const deleteId = seedItems[0].id;
    const updateId = seedItems[1].id;
    const draft = { ...seedItems[1], name: 'test' };
    const { result } = renderHook(() => useInventory());
    let rejectRequest: (value: Error) => void = () => {};
    vi.mocked(removePantryItem).mockImplementation(() => {
      return new Promise((_, reject) => {
        rejectRequest = reject;
      });
    });
    let deleteResult;

    act(() => {
      deleteResult = result.current.deleteItem(deleteId);
    });

    act(() => {
      result.current.updateItem(updateId, draft);
    });

    const rejectionCheck = expect(deleteResult).rejects.toThrow();
    await act(async () => {
      rejectRequest(new Error('Не удалось удалить продукт'));
    });
    await rejectionCheck;

    expect(result.current.items).toHaveLength(seedItems.length);
    expect(result.current.items.find((item) => item.id === deleteId)).toBeTruthy();
    expect(result.current.items.find((item) => item.id === updateId)?.name).toBe('test');
  });

  it('ошибка удаления не дублирует записи после синхронизации', async () => {
    const deleteId = seedItems[0].id;
    const { result } = renderHook(() => useInventory());
    let rejectRequest: (value: Error) => void = () => {};
    vi.mocked(removePantryItem).mockImplementation(() => {
      return new Promise((_, reject) => {
        rejectRequest = reject;
      });
    });
    vi.mocked(syncPantry).mockResolvedValue({
      items: seedItems.map((item) => ({ ...item, name: item.name.trim() })),
      syncedAt: new Date().toISOString(),
    });

    let deleteResult;

    act(() => {
      deleteResult = result.current.deleteItem(deleteId);
    });

    await act(async () => {
      await result.current.sync();
    });

    const rejectionCheck = expect(deleteResult).rejects.toThrow();
    await act(async () => {
      rejectRequest(new Error('Не удалось удалить продукт'));
    });
    await rejectionCheck;

    expect(result.current.items).toHaveLength(seedItems.length);
    expect(result.current.items.filter((item) => item.id === deleteId)).toHaveLength(1);
  });
});
