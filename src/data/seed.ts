import type { PantryItem } from '../types';

export const seedItems: PantryItem[] = [
  {
    id: 'item-oats', name: 'Овсяные хлопья', category: 'Grains', quantity: 650, unit: 'g', lowStockAt: 300,
    expiresAt: '2027-03-18', favorite: true, updatedAt: '2026-10-09T08:30:00.000Z',
  },
  {
    id: 'item-tomatoes', name: 'Помидоры черри', category: 'Produce', quantity: 8, unit: 'pcs', lowStockAt: 4,
    expiresAt: '2026-10-18', favorite: false, updatedAt: '2026-10-13T17:05:00.000Z',
  },
  {
    id: 'item-milk', name: 'Овсяное молоко', category: 'Dairy', quantity: 1, unit: 'l', lowStockAt: 1,
    expiresAt: '2026-10-16', favorite: true, updatedAt: '2026-10-12T12:10:00.000Z',
  },
  {
    id: 'item-beans', name: 'Чёрная фасоль', category: 'Canned', quantity: 3, unit: 'pcs', lowStockAt: 2,
    expiresAt: '2028-01-10', favorite: false, updatedAt: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'item-almonds', name: 'Жареный миндаль', category: 'Snacks', quantity: 120, unit: 'g', lowStockAt: 100,
    expiresAt: '2026-11-02', favorite: false, updatedAt: '2026-10-11T19:40:00.000Z',
  },
  {
    id: 'item-salt', name: 'Морская соль', category: 'Other', quantity: 500, unit: 'g', lowStockAt: 80,
    expiresAt: null, favorite: false, updatedAt: '2026-08-21T10:25:00.000Z',
  },
];
