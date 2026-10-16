import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from './App';
import { seedItems } from './data/seed';
import { act } from 'react';

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('новое уведомление не исчезает по таймеру предыдущего', async () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole('button', { name: `Действия с продуктом ${seedItems[0].name}` }),
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Удалить продукт' }));
      vi.advanceTimersByTime(450);
    });
    expect(screen.getByRole('status')).toHaveTextContent(`${seedItems[0].name}`);

    act(() => vi.advanceTimersByTime(2000));

    fireEvent.click(
      screen.getByRole('button', { name: `Действия с продуктом ${seedItems[1].name}` }),
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Удалить продукт' }));
      vi.advanceTimersByTime(450);
    });
    expect(screen.getByRole('status')).toHaveTextContent(`${seedItems[1].name}`);

    act(() => vi.advanceTimersByTime(2000));

    expect(screen.getByRole('status')).toHaveTextContent(`${seedItems[1].name}`);

    act(() => vi.advanceTimersByTime(1000));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
