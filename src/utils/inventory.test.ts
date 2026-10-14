import { describe, expect, it } from 'vitest';
import type { InventoryFilters, PantryItem } from '../types';
import { formatQuantity, getVisibleItems, isExpiringSoon, summarizeInventory } from './inventory';

const items: PantryItem[] = [
  { id: '1', name: 'Rice', category: 'Grains', quantity: 200, unit: 'g', lowStockAt: 300, expiresAt: '2026-10-20', favorite: false, updatedAt: '2026-10-10T10:00:00Z' },
  { id: '2', name: 'Peaches', category: 'Canned', quantity: 3, unit: 'pcs', lowStockAt: 1, expiresAt: '2027-04-01', favorite: true, updatedAt: '2026-10-12T10:00:00Z' },
];

const filters: InventoryFilters = { query: '', category: 'All', stock: 'all', sort: 'name' };
const today = new Date('2026-10-14T12:00:00');

describe('inventory utilities', () => {
  it('filters items by category', () => {
    expect(getVisibleItems(items, { ...filters, category: 'Canned' }, today).map((item) => item.name)).toEqual(['Peaches']);
  });

  it('matches search without case sensitivity', () => {
    expect(getVisibleItems(items, { ...filters, query: 'PEA' }, today)).toHaveLength(1);
  });

  it('identifies an item expiring within seven days', () => {
    expect(isExpiringSoon(items[0], today)).toBe(true);
    expect(isExpiringSoon(items[1], today)).toBe(false);
  });

  it('summarizes low and expiring inventory', () => {
    expect(summarizeInventory(items, today)).toEqual({ total: 2, low: 1, expiring: 1 });
  });

  it('uses a larger display unit when possible', () => {
    expect(formatQuantity({ quantity: 1500, unit: 'g' })).toBe('1.5 kg');
    expect(formatQuantity({ quantity: 750, unit: 'ml' })).toBe('750 ml');
  });
});
