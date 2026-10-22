import { describe, expect, it } from 'vitest';
import { parseInventoryCsv } from './csv';

describe('parseInventoryCsv', () => {
  it('преобразует корректные строки в черновики продуктов', () => {
    const result = parseInventoryCsv(
      'name,category,quantity,unit,lowStockAt,expiresAt\nЧечевица,Canned,4,pcs,2,2028-06-01',
    );
    expect(result).toEqual([
      {
        name: 'Чечевица',
        category: 'Canned',
        quantity: 4,
        unit: 'pcs',
        lowStockAt: 2,
        expiresAt: '2028-06-01',
        favorite: false,
      },
    ]);
  });

  it('сообщает о строках с неподдерживаемыми категориями', () => {
    expect(() =>
      parseInventoryCsv('name,category,quantity,unit,lowStockAt,expiresAt\nЧай,Drinks,2,pcs,1,'),
    ).toThrow('Некорректные данные в строке 2');
  });

  it('обрабатывает CSV с Windows-переносами строк', () => {
    const result = parseInventoryCsv(
      'name,category,quantity,unit,lowStockAt,expiresAt\r\nЧечевица,Canned,4,pcs,2,2028-06-01\r\nОвсяные хлопья,Grains,650,g,300,2027-03-18',
    );
    expect(result).toEqual([
      {
        name: 'Чечевица',
        category: 'Canned',
        quantity: 4,
        unit: 'pcs',
        lowStockAt: 2,
        expiresAt: '2028-06-01',
        favorite: false,
      },
      {
        name: 'Овсяные хлопья',
        category: 'Grains',
        quantity: 650,
        unit: 'g',
        lowStockAt: 300,
        expiresAt: '2027-03-18',
        favorite: false,
      },
    ]);
  });
});
