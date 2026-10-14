import { describe, expect, it } from 'vitest';
import type { ItemDraft } from '../types';
import { validateDraft } from './validation';

const validDraft: ItemDraft = {
  name: 'Pasta', category: 'Grains', quantity: 2, unit: 'pcs', lowStockAt: 1, expiresAt: null, favorite: false,
};

describe('validateDraft', () => {
  it('accepts a complete item without an expiry date', () => {
    expect(validateDraft(validDraft)).toEqual({});
  });

  it('rejects blank names and negative stock values', () => {
    expect(validateDraft({ ...validDraft, name: ' ', quantity: -1, lowStockAt: -2 })).toEqual({
      name: 'Enter an item name',
      quantity: 'Quantity cannot be negative',
      lowStockAt: 'Threshold cannot be negative',
    });
  });
});
