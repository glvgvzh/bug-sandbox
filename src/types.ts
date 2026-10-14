export const categories = ['Produce', 'Dairy', 'Grains', 'Canned', 'Snacks', 'Other'] as const;

export type Category = (typeof categories)[number];
export type Unit = 'pcs' | 'g' | 'kg' | 'ml' | 'l';
export type StockFilter = 'all' | 'low' | 'expiring' | 'favorites';
export type SortKey = 'name' | 'expiry' | 'recent';

export interface PantryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: Unit;
  lowStockAt: number;
  expiresAt: string | null;
  favorite: boolean;
  updatedAt: string;
}

export interface ItemDraft {
  name: string;
  category: Category;
  quantity: number;
  unit: Unit;
  lowStockAt: number;
  expiresAt: string | null;
  favorite: boolean;
}

export interface InventoryFilters {
  query: string;
  category: Category | 'All';
  stock: StockFilter;
  sort: SortKey;
}

export interface SyncResult {
  items: PantryItem[];
  syncedAt: string;
}
