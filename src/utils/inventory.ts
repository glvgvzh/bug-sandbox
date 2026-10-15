import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { InventoryFilters, PantryItem } from '../types';
import { unitLabels } from './labels';

export function isLowStock(item: PantryItem) {
  return item.quantity <= item.lowStockAt;
}

export function daysUntilExpiry(item: PantryItem, today = new Date()) {
  if (!item.expiresAt) return null;
  return differenceInCalendarDays(parseISO(item.expiresAt), today);
}

export function isExpiringSoon(item: PantryItem, today = new Date()) {
  const days = daysUntilExpiry(item, today);
  return days !== null && days >= 0 && days <= 7;
}

export function getVisibleItems(
  items: PantryItem[],
  filters: InventoryFilters,
  today = new Date(),
) {
  const query = filters.query.toLowerCase();
  const visible = items.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query);
    const matchesCategory = filters.category === 'All' || item.category === filters.category;
    const matchesStock =
      filters.stock === 'all' ||
      (filters.stock === 'low' && isLowStock(item)) ||
      (filters.stock === 'expiring' && isExpiringSoon(item, today)) ||
      (filters.stock === 'favorites' && item.favorite);

    return matchesQuery && matchesCategory && matchesStock;
  });

  return visible.sort((a, b) => {
    if (filters.sort === 'name') return a.name.localeCompare(b.name);
    if (filters.sort === 'recent') return b.updatedAt.localeCompare(a.updatedAt);
    return (a.expiresAt ?? '').localeCompare(b.expiresAt ?? '');
  });
}

export function formatQuantity(item: Pick<PantryItem, 'quantity' | 'unit'>) {
  if (item.unit === 'g' && item.quantity >= 1000) return `${item.quantity / 1000} кг`;
  if (item.unit === 'ml' && item.quantity >= 1000) return `${item.quantity / 1000} л`;
  return `${item.quantity} ${unitLabels[item.unit]}`;
}

export function summarizeInventory(items: PantryItem[], today = new Date()) {
  return {
    total: items.length,
    low: items.filter(isLowStock).length,
    expiring: items.filter((item) => isExpiringSoon(item, today)).length,
  };
}
