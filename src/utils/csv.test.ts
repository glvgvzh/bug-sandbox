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

  it('сообщает о строках с пустыми остатками и порогами малого запаса', () => {
    expect(() =>
      parseInventoryCsv(
        'name,category,quantity,unit,lowStockAt,expiresAt\nПустой остаток,Canned,,pcs,2,2028-06-01',
      ),
    ).toThrow('Некорректные данные в строке 2');
    expect(() =>
      parseInventoryCsv(
        'name,category,quantity,unit,lowStockAt,expiresAt\nПустой порог мин запаса,Canned,2,pcs,,2028-06-01',
      ),
    ).toThrow('Некорректные данные в строке 2');
  });

  it('сообщает о строках с бесконечными остатками и порогами малого запаса', () => {
    expect(() =>
      parseInventoryCsv(
        'name,category,quantity,unit,lowStockAt,expiresAt\nБесконечный остаток,Canned,Infinity,pcs,2,2028-06-01',
      ),
    ).toThrow('Некорректные данные в строке 2');
    expect(() =>
      parseInventoryCsv(
        'name,category,quantity,unit,lowStockAt,expiresAt\nБесконечный порог мин запаса,Canned,2,pcs,Infinity,2028-06-01',
      ),
    ).toThrow('Некорректные данные в строке 2');
  });

  it('сообщает о строках с текстовыми остатками и порогами малого запаса', () => {
    expect(() =>
      parseInventoryCsv(
        'name,category,quantity,unit,lowStockAt,expiresAt\nТекстовый остаток,Canned,test,pcs,2,2028-06-01',
      ),
    ).toThrow('Некорректные данные в строке 2');
    expect(() =>
      parseInventoryCsv(
        'name,category,quantity,unit,lowStockAt,expiresAt\nТекстовый порог мин запаса,Canned,2,pcs,test,2028-06-01',
      ),
    ).toThrow('Некорректные данные в строке 2');
  });

  it('сообщает о строках с отрицательными остатками и порогами малого запаса', () => {
    expect(() =>
      parseInventoryCsv(
        'name,category,quantity,unit,lowStockAt,expiresAt\nОтрицательный остаток,Canned,-4,pcs,2,2028-06-01',
      ),
    ).toThrow('Некорректные данные в строке 2');
    expect(() =>
      parseInventoryCsv(
        'name,category,quantity,unit,lowStockAt,expiresAt\nОтрицательный порог мин запаса,Canned,2,pcs,-4,2028-06-01',
      ),
    ).toThrow('Некорректные данные в строке 2');
  });

  it('корректно импортирует нули в остатке или пороге минимального запаса', () => {
    const zeroQuantityResult = parseInventoryCsv(
      'name,category,quantity,unit,lowStockAt,expiresAt\nЧечевица,Canned,0,pcs,2,2028-06-01',
    );
    expect(zeroQuantityResult).toEqual([
      {
        name: 'Чечевица',
        category: 'Canned',
        quantity: 0,
        unit: 'pcs',
        lowStockAt: 2,
        expiresAt: '2028-06-01',
        favorite: false,
      },
    ]);

    const zeroLowStockAtResult = parseInventoryCsv(
      'name,category,quantity,unit,lowStockAt,expiresAt\nЧечевица,Canned,2,pcs,0,2028-06-01',
    );
    expect(zeroLowStockAtResult).toEqual([
      {
        name: 'Чечевица',
        category: 'Canned',
        quantity: 2,
        unit: 'pcs',
        lowStockAt: 0,
        expiresAt: '2028-06-01',
        favorite: false,
      },
    ]);
  });

  it('корректно импортирует запятые в названии', () => {
    const result = parseInventoryCsv(
      'name,category,quantity,unit,lowStockAt,expiresAt\n"Чечевица, красная",Canned,4,pcs,2,2028-06-01',
    );
    expect(result).toEqual([
      {
        name: 'Чечевица, красная',
        category: 'Canned',
        quantity: 4,
        unit: 'pcs',
        lowStockAt: 2,
        expiresAt: '2028-06-01',
        favorite: false,
      },
    ]);
  });

  it('корректно импортирует кавычки в названии', () => {
    const result = parseInventoryCsv(
      'name,category,quantity,unit,lowStockAt,expiresAt\n"""Чечевица""",Canned,4,pcs,2,2028-06-01',
    );
    expect(result).toEqual([
      {
        name: '"Чечевица"',
        category: 'Canned',
        quantity: 4,
        unit: 'pcs',
        lowStockAt: 2,
        expiresAt: '2028-06-01',
        favorite: false,
      },
    ]);
  });

  it('сообщает об ошибке, если в строке незакрытые кавычки', () => {
    expect(() =>
      parseInventoryCsv(
        'name,category,quantity,unit,lowStockAt,expiresAt\nЧечевица,Canned,4,pcs,2,"2028-06-01',
      ),
    ).toThrow('Некорректные данные в строке 2');
  });
});
