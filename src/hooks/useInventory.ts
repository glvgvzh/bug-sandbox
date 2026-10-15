import { useMemo, useState } from 'react';
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
  const [items, setItems] = useLocalStorage<PantryItem[]>('pantry-pilot:items', seedItems);
  const [filters, setFilters] = useState(defaultFilters);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const visibleItems = useMemo(() => getVisibleItems(items, filters), [items, filters]);
  const summary = useMemo(() => summarizeInventory(items), [items]);

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
              quantity: draft.quantity || item.quantity,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  }

  function toggleFavorite(id: string) {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) return;
    setItems(
      items.map((candidate) =>
        candidate.id === id ? { ...candidate, favorite: !item.favorite } : candidate,
      ),
    );
  }

  async function deleteItem(id: string) {
    const previousItems = items;
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      await removePantryItem(id);
    } catch (error) {
      setItems([...previousItems]);
      throw error;
    }
  }

  async function sync() {
    setIsSyncing(true);
    try {
      const result = await syncPantry(items);
      setItems(result.items);
      setLastSyncedAt(result.syncedAt);
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Не удалось синхронизировать запасы');
    } finally {
      setIsSyncing(false);
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
