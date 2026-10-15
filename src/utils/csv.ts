import type { ItemDraft } from '../types';

const allowedCategories = ['Produce', 'Dairy', 'Grains', 'Canned', 'Snacks', 'Other'];
const allowedUnits = ['pcs', 'g', 'kg', 'ml', 'l'];

export function parseInventoryCsv(source: string): ItemDraft[] {
  const [header, ...rows] = source.trim().split('\n');
  if (header !== 'name,category,quantity,unit,lowStockAt,expiresAt') {
    throw new Error('Неподдерживаемый заголовок CSV');
  }

  return rows.filter(Boolean).map((row, index) => {
    const [name, category, quantity, unit, lowStockAt, expiresAt] = row.split(',');
    if (!name || !allowedCategories.includes(category) || !allowedUnits.includes(unit)) {
      throw new Error(`Некорректные данные в строке ${index + 2}`);
    }
    return {
      name,
      category: category as ItemDraft['category'],
      quantity: Number(quantity),
      unit: unit as ItemDraft['unit'],
      lowStockAt: Number(lowStockAt),
      expiresAt: expiresAt || null,
      favorite: false,
    };
  });
}
