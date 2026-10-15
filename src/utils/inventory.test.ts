import { describe, expect, it } from 'vitest';
import type { InventoryFilters, PantryItem } from '../types';
import { formatQuantity, getVisibleItems, isExpiringSoon, summarizeInventory } from './inventory';

const items: PantryItem[] = [
  {
    id: '1',
    name: 'Рис',
    category: 'Grains',
    quantity: 200,
    unit: 'g',
    lowStockAt: 300,
    expiresAt: '2026-10-20',
    favorite: false,
    updatedAt: '2026-10-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Персики',
    category: 'Canned',
    quantity: 3,
    unit: 'pcs',
    lowStockAt: 1,
    expiresAt: '2027-04-01',
    favorite: true,
    updatedAt: '2026-10-12T10:00:00Z',
  },
];

const filters: InventoryFilters = { query: '', category: 'All', stock: 'all', sort: 'name' };
const today = new Date('2026-10-14T12:00:00');

describe('утилиты для работы с запасами', () => {
  it('фильтрует продукты по категории', () => {
    expect(
      getVisibleItems(items, { ...filters, category: 'Canned' }, today).map((item) => item.name),
    ).toEqual(['Персики']);
  });

  it('выполняет поиск без учёта регистра', () => {
    expect(getVisibleItems(items, { ...filters, query: 'ПЕР' }, today)).toHaveLength(1);
  });

  it('находит продукт со сроком годности в ближайшие семь дней', () => {
    expect(isExpiringSoon(items[0], today)).toBe(true);
    expect(isExpiringSoon(items[1], today)).toBe(false);
  });

  it('подсчитывает заканчивающиеся и скоропортящиеся продукты', () => {
    expect(summarizeInventory(items, today)).toEqual({ total: 2, low: 1, expiring: 1 });
  });

  it('использует более крупную единицу измерения, когда это возможно', () => {
    expect(formatQuantity({ quantity: 1500, unit: 'g' })).toBe('1.5 кг');
    expect(formatQuantity({ quantity: 750, unit: 'ml' })).toBe('750 мл');
  });
});
