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
        <h2>No pantry items found</h2>
        <p>Try changing the search or filters.</p>
      </div>
    );
  }

  return (
    <section className="item-grid" aria-label="Pantry items">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onOpen={onOpen} onFavorite={onFavorite} onMenu={onMenu} />
      ))}
    </section>
  );
}
