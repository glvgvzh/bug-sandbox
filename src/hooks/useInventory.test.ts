import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInventory } from './useInventory';
import { renderHook } from '@testing-library/react';
import { seedItems } from '../data/seed';
import { act } from 'react';
import { removePantryItem, syncPantry } from '../services/pantryApi';
import type { ItemDraft, PantryItem, SyncResult } from '../types';

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

  it('не теряет быстрые переключения избранного у разных продуктов', () => {
    const firstItem = seedItems[4];
    const secondItem = seedItems[5];
    const { result } = renderHook(() => useInventory());
    act(() => {
      result.current.toggleFavorite(firstItem.id);
      result.current.toggleFavorite(secondItem.id);
    });

    const firstItemResult = result.current.items.find((item) => item.id === firstItem.id);
    const secondItemResult = result.current.items.find((item) => item.id === secondItem.id);

    expect(firstItemResult?.favorite).toBe(true);
    expect(secondItemResult?.favorite).toBe(true);
  });

  it('два быстрых переключения возвращают исходный статус', () => {
    const testItem = seedItems[4];
    const { result } = renderHook(() => useInventory());
    act(() => {
      result.current.toggleFavorite(testItem.id);
      result.current.toggleFavorite(testItem.id);
    });

    const itemResult = result.current.items.find((item) => item.id === testItem.id);

    expect(itemResult?.favorite).toBe(false);
  });

  it('синхронизация не стирает изменения, сделанные во время запроса добавления продукта', async () => {
    const newItemDraft: ItemDraft = {
      name: 'test',
      category: 'Other',
      quantity: 1,
      unit: 'kg',
      lowStockAt: 1,
      expiresAt: null,
      favorite: false,
    };
    const { result } = renderHook(() => useInventory());
    let resolveRequest: (value: SyncResult) => void = () => {};
    vi.mocked(syncPantry).mockImplementation(() => {
      return new Promise((resolve) => {
        resolveRequest = resolve;
      });
    });
    let syncResult;

    act(() => {
      syncResult = result.current.sync();
    });
    await act(async () => {
      result.current.addItem(newItemDraft);
    });
    await act(async () => {
      resolveRequest({
        items: seedItems.map((item) => ({ ...item, name: item.name.trim() })),
        syncedAt: new Date().toISOString(),
      });
    });
    await syncResult;

    expect(result.current.items).toHaveLength(seedItems.length + 1);
    expect(result.current.items.filter((item) => item.name === newItemDraft.name)).toHaveLength(1);
  });

  it('после завершения синхронизации сохраняется локально изменённая версия продукта, а неизменённый продукт принимает серверную версию', async () => {
    const testItems: PantryItem[] = [
      {
        id: 'item-oats',
        name: 'Овсяные хлопья',
        category: 'Grains',
        quantity: 650,
        unit: 'g',
        lowStockAt: 300,
        expiresAt: '2027-03-18',
        favorite: true,
        updatedAt: '2026-10-09T08:30:00.000Z',
      },
      {
        id: 'item-tomatoes',
        name: '   Помидоры черри   ',
        category: 'Produce',
        quantity: 8,
        unit: 'pcs',
        lowStockAt: 4,
        expiresAt: '2026-10-18',
        favorite: false,
        updatedAt: '2026-10-13T17:05:00.000Z',
      },
    ];
    localStorage.setItem('pantry-pilot:items', JSON.stringify(testItems));
    const itemDraft: ItemDraft = { ...testItems[0], name: 'testName' };

    const { result } = renderHook(() => useInventory());
    let resolveRequest: (value: SyncResult) => void = () => {};
    vi.mocked(syncPantry).mockImplementation(() => {
      return new Promise((resolve) => {
        resolveRequest = resolve;
      });
    });
    let syncResult;

    act(() => {
      syncResult = result.current.sync();
    });
    await act(async () => {
      result.current.updateItem(testItems[0].id, itemDraft);
    });
    await act(async () => {
      resolveRequest({
        items: testItems.map((item) => ({ ...item, name: item.name.trim() })),
        syncedAt: new Date().toISOString(),
      });
    });
    await syncResult;

    const resultItem = result.current.items.filter((item) => item.id === testItems[0].id);
    expect(resultItem).toHaveLength(1);
    expect(resultItem[0].name).toBe(itemDraft.name);
    expect(resultItem[0].updatedAt).toBe(fakeDate.toISOString());

    const unchangedItem = result.current.items.filter((item) => item.id === testItems[1].id);
    expect(unchangedItem).toHaveLength(1);
    expect(unchangedItem[0]).toStrictEqual({ ...testItems[1], name: 'Помидоры черри' });
  });

  it('более старый ответ синхронизации не перезаписывает результат нового', async () => {
    const testItems: PantryItem[] = [
      {
        id: 'item-oats',
        name: 'Овсяные хлопья',
        category: 'Grains',
        quantity: 650,
        unit: 'g',
        lowStockAt: 300,
        expiresAt: '2027-03-18',
        favorite: true,
        updatedAt: '2026-10-09T08:30:00.000Z',
      },
      {
        id: 'item-tomatoes',
        name: '   Помидоры черри   ',
        category: 'Produce',
        quantity: 8,
        unit: 'pcs',
        lowStockAt: 4,
        expiresAt: '2026-10-18',
        favorite: false,
        updatedAt: '2026-10-13T17:05:00.000Z',
      },
    ];
    localStorage.setItem('pantry-pilot:items', JSON.stringify(testItems));
    const { result } = renderHook(() => useInventory());

    let resolveFirstRequest: (value: SyncResult) => void = () => {};
    let resolveSecondRequest: (value: SyncResult) => void = () => {};
    vi.mocked(syncPantry)
      .mockImplementationOnce(() => {
        return new Promise((resolve) => {
          resolveFirstRequest = resolve;
        });
      })
      .mockImplementationOnce(() => {
        return new Promise((resolve) => {
          resolveSecondRequest = resolve;
        });
      });
    let firstSyncResult: Promise<void>;
    let secondSyncResult: Promise<void>;

    act(() => {
      firstSyncResult = result.current.sync();
      secondSyncResult = result.current.sync();
    });
    expect(result.current.isSyncing).toBe(true);
    expect(syncPantry).toHaveBeenCalledTimes(2);

    const firstSyncedAt = '2026-10-21T10:00:00.000Z';
    const secondSyncedAt = '2026-10-21T10:01:00.000Z';

    await act(async () => {
      resolveSecondRequest({
        items: [{ ...testItems[0], name: 'Новый результат' }, testItems[1]],
        syncedAt: secondSyncedAt,
      });
      await secondSyncResult;
    });

    expect(result.current.lastSyncedAt).toBe(secondSyncedAt);
    expect(result.current.items[0].name).toBe('Новый результат');

    await act(async () => {
      resolveFirstRequest({
        items: [{ ...testItems[0], name: 'Старый результат' }, testItems[1]],
        syncedAt: firstSyncedAt,
      });
      await firstSyncResult;
    });

    expect(result.current.lastSyncedAt).toBe(secondSyncedAt);
    expect(result.current.items[0].name).toBe('Новый результат');
  });

  it('завершение старого запроса не выключает индикатор новой синхронизации', async () => {
    const { result } = renderHook(() => useInventory());

    let resolveFirstRequest: (value: SyncResult) => void = () => {};
    let resolveSecondRequest: (value: SyncResult) => void = () => {};
    vi.mocked(syncPantry)
      .mockImplementationOnce(() => {
        return new Promise((resolve) => {
          resolveFirstRequest = resolve;
        });
      })
      .mockImplementationOnce(() => {
        return new Promise((resolve) => {
          resolveSecondRequest = resolve;
        });
      });
    let firstSyncResult: Promise<void>;
    let secondSyncResult: Promise<void>;

    act(() => {
      firstSyncResult = result.current.sync();
      secondSyncResult = result.current.sync();
    });
    expect(result.current.isSyncing).toBe(true);
    expect(syncPantry).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveFirstRequest({
        items: seedItems,
        syncedAt: new Date().toISOString(),
      });
      await firstSyncResult;
    });

    expect(result.current.isSyncing).toBe(true);

    await act(async () => {
      resolveSecondRequest({
        items: seedItems,
        syncedAt: new Date().toISOString(),
      });
      await secondSyncResult;
    });

    expect(result.current.isSyncing).toBe(false);
  });

  it('ошибка старого запроса не заменяет результат успешной новой синхронизации', async () => {
    const { result } = renderHook(() => useInventory());

    let rejectFirstRequest: (reason?: unknown) => void = () => {};
    let resolveSecondRequest: (value: SyncResult) => void = () => {};
    vi.mocked(syncPantry)
      .mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          rejectFirstRequest = reject;
        });
      })
      .mockImplementationOnce(() => {
        return new Promise((resolve) => {
          resolveSecondRequest = resolve;
        });
      });
    let firstSyncResult: Promise<void>;
    let secondSyncResult: Promise<void>;

    act(() => {
      firstSyncResult = result.current.sync();
      secondSyncResult = result.current.sync();
    });

    await act(async () => {
      resolveSecondRequest({
        items: seedItems,
        syncedAt: new Date().toISOString(),
      });
      await secondSyncResult;
    });

    expect(result.current.syncError).toBe(null);

    await act(async () => {
      rejectFirstRequest(new Error('Ошибка старого запроса'));
      await firstSyncResult;
    });

    expect(result.current.syncError).toBe(null);
  });
});
