import type { PantryItem, SyncResult } from '../types';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function syncPantry(items: PantryItem[]): Promise<SyncResult> {
  await wait(650 + Math.random() * 500);
  if (Math.random() < 0.12) throw new Error('Сервис учёта запасов временно недоступен');

  return {
    items: items.map((item) => ({ ...item, name: item.name.trim() })),
    syncedAt: new Date().toISOString(),
  };
}

export async function removePantryItem(id: string): Promise<{ id: string }> {
  await wait(450);
  if (Math.random() < 0.15) throw new Error('Не удалось удалить продукт');
  return { id };
}
