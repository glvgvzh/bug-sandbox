import { describe, expect, it } from 'vitest';
import { parseInventoryCsv } from './csv';

describe('parseInventoryCsv', () => {
  it('converts valid rows into item drafts', () => {
    const result = parseInventoryCsv('name,category,quantity,unit,lowStockAt,expiresAt\nLentils,Canned,4,pcs,2,2028-06-01');
    expect(result).toEqual([{
      name: 'Lentils', category: 'Canned', quantity: 4, unit: 'pcs', lowStockAt: 2, expiresAt: '2028-06-01', favorite: false,
    }]);
  });

  it('reports rows with unsupported categories', () => {
    expect(() => parseInventoryCsv('name,category,quantity,unit,lowStockAt,expiresAt\nTea,Drinks,2,pcs,1,'))
      .toThrow('Invalid data on row 2');
  });
});
