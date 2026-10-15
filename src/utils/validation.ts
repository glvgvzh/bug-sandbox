import type { ItemDraft } from '../types';

export type DraftErrors = Partial<Record<'name' | 'quantity' | 'lowStockAt' | 'expiresAt', string>>;

export function validateDraft(draft: ItemDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.name.trim()) errors.name = 'Введите название продукта';
  if (draft.quantity < 0) errors.quantity = 'Количество не может быть отрицательным';
  if (draft.lowStockAt < 0) errors.lowStockAt = 'Порог не может быть отрицательным';
  if (draft.expiresAt && Number.isNaN(Date.parse(draft.expiresAt)))
    errors.expiresAt = 'Введите корректную дату';
  return errors;
}
