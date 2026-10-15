import type { Category, Unit } from '../types';

export const categoryLabels: Record<Category, string> = {
  Produce: 'Овощи и фрукты',
  Dairy: 'Молочные продукты',
  Grains: 'Крупы и злаки',
  Canned: 'Консервы',
  Snacks: 'Снеки',
  Other: 'Другое',
};

export const unitLabels: Record<Unit, string> = {
  pcs: 'шт.',
  g: 'г',
  kg: 'кг',
  ml: 'мл',
  l: 'л',
};
