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
    localStorage.clear();
    vi.restoreAllMocks();
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

  it('при ошибке записи после изменения продукта появляется предупреждение и соответствующий статус, которые удаляются после успешного сохранения', () => {
    render(<App />);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('Ошибка записи');
    });

    expect(screen.queryByText(/Не удалось сохранить изменения в браузере/)).not.toBeInTheDocument();
    expect(screen.queryByText('Не сохранено на устройстве')).not.toBeInTheDocument();

    const item = seedItems.find((item) => !item.favorite)!;

    fireEvent.click(screen.getByRole('button', { name: `Добавить ${item.name} в избранное` }));

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Не удалось сохранить изменения в браузере/)).toBeInTheDocument();
    expect(screen.getByText('Не сохранено на устройстве')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: `Удалить ${item.name} из избранного` }));

    expect(setItemSpy).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/Не удалось сохранить изменения в браузере/)).not.toBeInTheDocument();
    expect(screen.queryByText('Не сохранено на устройстве')).not.toBeInTheDocument();
    expect(screen.getByText('Сохранено на устройстве')).toBeInTheDocument();
  });
});
