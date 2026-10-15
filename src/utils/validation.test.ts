import { describe, expect, it } from 'vitest';
import type { ItemDraft } from '../types';
import { validateDraft } from './validation';

const validDraft: ItemDraft = {
  name: 'Макароны', category: 'Grains', quantity: 2, unit: 'pcs', lowStockAt: 1, expiresAt: null, favorite: false,
};

describe('validateDraft', () => {
  it('принимает заполненный продукт без срока годности', () => {
    expect(validateDraft(validDraft)).toEqual({});
  });

  it('отклоняет пустое название и отрицательные значения запаса', () => {
    expect(validateDraft({ ...validDraft, name: ' ', quantity: -1, lowStockAt: -2 })).toEqual({
      name: 'Введите название продукта',
      quantity: 'Количество не может быть отрицательным',
      lowStockAt: 'Порог не может быть отрицательным',
    });
  });
});
