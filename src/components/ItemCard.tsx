import { CalendarDays, Heart, MoreHorizontal } from 'lucide-react';
import type { PantryItem } from '../types';
import { daysUntilExpiry, formatQuantity, isLowStock } from '../utils/inventory';
import { categoryLabels } from '../utils/labels';

interface ItemCardProps {
  item: PantryItem;
  onOpen: (item: PantryItem) => void;
  onFavorite: (id: string) => void;
  onMenu: (item: PantryItem, target: HTMLElement) => void;
}

function expiryLabel(item: PantryItem) {
  const days = daysUntilExpiry(item);
  if (days === null) return 'Срок годности не указан';
  if (days < 0) return `Просрочено на ${Math.abs(days)} дн.`;
  if (days === 0) return 'Срок годности истекает сегодня';
  return `До окончания срока: ${days} дн.`;
}

export function ItemCard({ item, onOpen, onFavorite, onMenu }: ItemCardProps) {
  const low = isLowStock(item);
  const expiry = daysUntilExpiry(item);
  const expiryTone =
    expiry !== null && expiry <= 3 ? 'danger' : expiry !== null && expiry <= 7 ? 'warning' : '';

  return (
    <article className="item-card" tabIndex={0} onClick={() => onOpen(item)}>
      <div className="card-topline">
        <span className="category-pill">{categoryLabels[item.category]}</span>
        <div className="card-buttons" onClick={(e) => e.stopPropagation()}>
          <button
            className={`icon-button favorite-button ${item.favorite ? 'active' : ''}`}
            aria-label={
              item.favorite
                ? `Удалить ${item.name} из избранного`
                : `Добавить ${item.name} в избранное`
            }
            onClick={() => onFavorite(item.id)}
          >
            <Heart size={17} fill={item.favorite ? 'currentColor' : 'none'} />
          </button>
          <button
            className="icon-button"
            aria-label={`Действия с продуктом ${item.name}`}
            onClick={(event) => onMenu(item, event.currentTarget)}
          >
            <MoreHorizontal size={19} />
          </button>
        </div>
      </div>
      <h3>{item.name}</h3>
      <div className="quantity-line">
        <strong>{formatQuantity(item)}</strong>
        {low && <span className="low-badge">Заканчивается</span>}
      </div>
      <div className={`expiry-line ${expiryTone}`}>
        <CalendarDays size={16} />
        <span>{expiryLabel(item)}</span>
      </div>
    </article>
  );
}
