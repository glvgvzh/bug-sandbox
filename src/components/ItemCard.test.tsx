import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemCard } from './ItemCard';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

function createItemCard(
  overrides: Partial<ComponentProps<typeof ItemCard>> = {},
): ComponentProps<typeof ItemCard> {
  return {
    item: {
      id: 'item-oats',
      name: 'Овсяные хлопья',
      category: 'Grains',
      quantity: 650,
      unit: 'g',
      lowStockAt: 300,
      expiresAt: '2027-03-18',
      favorite: true,
      updatedAt: '2026-10-09T08:30:00.000Z',
    },
    onOpen: vi.fn(),
    onFavorite: vi.fn(),
    onMenu: vi.fn(),
    ...overrides,
  };
}

function renderItemCard(overrides: Partial<ComponentProps<typeof ItemCard>> = {}) {
  render(<ItemCard {...createItemCard(overrides)} />);
}

describe('ItemCard', () => {
  it('нажатие на избранное не открывает редактирование карточки', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onFavorite = vi.fn();
    renderItemCard({ onOpen, onFavorite });

    await user.click(screen.getByRole('button', { name: /избранно/ }));
    expect(onFavorite).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('нажатие на действия с продуктом не открывает редактирование карточки', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onMenu = vi.fn();
    renderItemCard({ onOpen, onMenu });

    await user.click(screen.getByRole('button', { name: /Действия с продуктом/ }));
    expect(onMenu).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('нажатие на саму карточку открывает редактирование карточки', async () => {
    const user = userEvent.setup();
    const itemName = createItemCard().item.name;
    const onOpen = vi.fn();
    renderItemCard({ onOpen });

    await user.click(screen.getByText(itemName));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
