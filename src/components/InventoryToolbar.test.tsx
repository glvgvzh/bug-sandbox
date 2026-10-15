import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { InventoryFilters } from '../types';
import { InventoryToolbar } from './InventoryToolbar';

const filters: InventoryFilters = { query: '', category: 'All', stock: 'all', sort: 'recent' };

describe('InventoryToolbar', () => {
  it('передаёт изменение поискового запроса родительскому компоненту', async () => {
    const onChange = vi.fn();
    render(<InventoryToolbar filters={filters} onChange={onChange} />);
    await userEvent.type(screen.getByRole('searchbox'), 'овсянка');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toEqual({ ...filters, query: 'о' });
  });
});
