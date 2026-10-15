import { PackageSearch } from 'lucide-react';
import type { PantryItem } from '../types';
import { ItemCard } from './ItemCard';

interface ItemGridProps {
  items: PantryItem[];
  onOpen: (item: PantryItem) => void;
  onFavorite: (id: string) => void;
  onMenu: (item: PantryItem, target: HTMLElement) => void;
}

export function ItemGrid({ items, onOpen, onFavorite, onMenu }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <PackageSearch size={34} />
        <h2>Продукты не найдены</h2>
        <p>Попробуйте изменить поисковый запрос или фильтры.</p>
      </div>
    );
  }

  return (
    <section className="item-grid" aria-label="Продукты в кладовой">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onOpen={onOpen}
          onFavorite={onFavorite}
          onMenu={onMenu}
        />
      ))}
    </section>
  );
}
