import { CalendarDays, Heart, MoreHorizontal } from 'lucide-react';
import type { PantryItem } from '../types';
import { daysUntilExpiry, formatQuantity, isLowStock } from '../utils/inventory';

interface ItemCardProps {
  item: PantryItem;
  onOpen: (item: PantryItem) => void;
  onFavorite: (id: string) => void;
  onMenu: (item: PantryItem, target: HTMLElement) => void;
}

function expiryLabel(item: PantryItem) {
  const days = daysUntilExpiry(item);
  if (days === null) return 'No expiry date';
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  return `Expires in ${days}d`;
}

export function ItemCard({ item, onOpen, onFavorite, onMenu }: ItemCardProps) {
  const low = isLowStock(item);
  const expiry = daysUntilExpiry(item);
  const expiryTone = expiry !== null && expiry <= 3 ? 'danger' : expiry !== null && expiry <= 7 ? 'warning' : '';

  return (
    <article className="item-card" tabIndex={0} onClick={() => onOpen(item)}>
      <div className="card-topline">
        <span className="category-pill">{item.category}</span>
        <div className="card-buttons">
          <button
            className={`icon-button favorite-button ${item.favorite ? 'active' : ''}`}
            aria-label={item.favorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
            onClick={() => onFavorite(item.id)}
          >
            <Heart size={17} fill={item.favorite ? 'currentColor' : 'none'} />
          </button>
          <button
            className="icon-button"
            aria-label={`Actions for ${item.name}`}
            onClick={(event) => onMenu(item, event.currentTarget)}
          >
            <MoreHorizontal size={19} />
          </button>
        </div>
      </div>
      <h3>{item.name}</h3>
      <div className="quantity-line">
        <strong>{formatQuantity(item)}</strong>
        {low && <span className="low-badge">Low stock</span>}
      </div>
      <div className={`expiry-line ${expiryTone}`}>
        <CalendarDays size={16} />
        <span>{expiryLabel(item)}</span>
      </div>
    </article>
  );
}
