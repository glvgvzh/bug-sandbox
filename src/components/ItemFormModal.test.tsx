import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ItemFormModal } from './ItemFormModal';
import type { ComponentProps } from 'react';
import { seedItems } from '../data/seed';
import userEvent from '@testing-library/user-event';

function createItemFormModal(
  overrides: Partial<ComponentProps<typeof ItemFormModal>> = {},
): ComponentProps<typeof ItemFormModal> {
  return {
    item: seedItems[1],
    onClose: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };
}

function renderItemFormModal(overrides: Partial<ComponentProps<typeof ItemFormModal>> = {}) {
  return render(<ItemFormModal {...createItemFormModal(overrides)} />);
}

describe('ItemFormModal', () => {
  it('удаляет обработчик Escape при размонтировании формы', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { unmount } = renderItemFormModal({ onClose });
    unmount();
    await user.keyboard('{Escape}');

    renderItemFormModal({ onClose });
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
