import { useMemo, useRef, useState } from 'react';
import { seedItems } from '../data/seed';
import { removePantryItem, syncPantry } from '../services/pantryApi';
import type { InventoryFilters, ItemDraft, PantryItem } from '../types';
import { getVisibleItems, summarizeInventory } from '../utils/inventory';
import { useLocalStorage } from './useLocalStorage';

const defaultFilters: InventoryFilters = {
  query: '',
  category: 'All',
  stock: 'all',
  sort: 'recent',
};

export function useInventory() {
  const [items, setItems, hasStorageError] = useLocalStorage<PantryItem[]>(
    'pantry-pilot:items',
    seedItems,
  );
  const [filters, setFilters] = useState(defaultFilters);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const visibleItems = useMemo(() => getVisibleItems(items, filters), [items, filters]);
  const summary = useMemo(() => summarizeInventory(items), [items]);

  const latestSyncRequestId = useRef(0);

  function addItem(draft: ItemDraft) {
    const item: PantryItem = {
      ...draft,
      id: `item-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setItems((current) => [item, ...current]);
  }

  function updateItem(id: string, draft: ItemDraft) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...draft,
              quantity: draft.quantity,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  }

  function toggleFavorite(id: string) {
    setItems((prev) => {
      const prevItem = prev.find((candidate) => candidate.id === id);
      if (!prevItem) return prev;
      return prev.map((candidate) =>
        candidate.id === id ? { ...candidate, favorite: !prevItem.favorite } : candidate,
      );
    });
  }

  async function deleteItem(id: string) {
    const itemToDelete = items.find((item) => item.id === id);
    if (!itemToDelete) {
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      await removePantryItem(id);
    } catch (error) {
      setItems((prev) => {
        if (!prev.find((item) => item.id === itemToDelete.id)) {
          return [...prev, itemToDelete];
        }
        return prev;
      });
      throw error;
    }
  }

  async function sync() {
    latestSyncRequestId.current++;
    const requestId = latestSyncRequestId.current;
    setIsSyncing(true);
    try {
      const result = await syncPantry(items);
      if (requestId !== latestSyncRequestId.current) return;
      setItems((currentItems) =>
        currentItems.map((currentItem) => {
          const syncedItem = result.items.find((resultItem) => resultItem.id === currentItem.id);
          if (!syncedItem) return currentItem;
          return currentItem.updatedAt > syncedItem.updatedAt ? currentItem : syncedItem;
        }),
      );
      setLastSyncedAt(result.syncedAt);
      setSyncError(null);
    } catch (error) {
      if (requestId !== latestSyncRequestId.current) return;
      setSyncError(error instanceof Error ? error.message : 'Не удалось синхронизировать запасы');
    } finally {
      if (requestId === latestSyncRequestId.current) {
        setIsSyncing(false);
      }
    }
  }

  function importItems(drafts: ItemDraft[]) {
    const timestamp = new Date().toISOString();
    const imported = drafts.map((draft, index): PantryItem => ({
      ...draft,
      id: `import-${Date.now()}-${index}`,
      updatedAt: timestamp,
    }));
    setItems((current) => [...imported, ...current]);
  }

  return {
    items,
    hasStorageError,
    visibleItems,
    summary,
    filters,
    setFilters,
    addItem,
    updateItem,
    toggleFavorite,
    deleteItem,
    importItems,
    sync,
    isSyncing,
    syncError,
    lastSyncedAt,
  };
}
