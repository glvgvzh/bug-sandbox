import { describe, it, expect, afterEach, vi } from 'vitest';
import { useLocalStorage } from './useLocalStorage';
import { renderHook, act } from '@testing-library/react';
import { seedItems } from '../data/seed';

describe('useLocalStorage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('возвращает начальное значение и не роняет приложение если JSON в localStorage поврежден', () => {
    const key = 'pantry-pilot:items';
    localStorage.setItem(key, 'broken-json');

    const { result } = renderHook(() => useLocalStorage(key, seedItems));
    expect(result.current[0]).toStrictEqual(seedItems);
  });

  it('сохраняет состояние в памяти при ошибке записи и сбрасывает ошибку после успешной записи', () => {
    const key = 'pantry-pilot:items';
    const { result } = renderHook(() => useLocalStorage(key, seedItems));

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('Ошибка записи');
    });

    const newItems = seedItems.slice(1);
    const setItems = result.current[1];

    act(() => setItems(newItems));

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(result.current[0]).toStrictEqual(newItems);
    expect(result.current[2]).toBe(true);

    act(() => setItems(seedItems));

    expect(setItemSpy).toHaveBeenCalledTimes(2);
    expect(result.current[2]).toBe(false);
  });
});
