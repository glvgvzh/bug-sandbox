import type { ItemDraft } from '../types';

export type DraftErrors = Partial<Record<'name' | 'quantity' | 'lowStockAt' | 'expiresAt', string>>;

export function validateDraft(draft: ItemDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.name.trim()) errors.name = 'Enter an item name';
  if (draft.quantity < 0) errors.quantity = 'Quantity cannot be negative';
  if (draft.lowStockAt < 0) errors.lowStockAt = 'Threshold cannot be negative';
  if (draft.expiresAt && Number.isNaN(Date.parse(draft.expiresAt))) errors.expiresAt = 'Enter a valid date';
  return errors;
}
