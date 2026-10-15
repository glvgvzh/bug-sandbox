import { Search } from 'lucide-react';
import { categories, type InventoryFilters, type StockFilter } from '../types';
import { categoryLabels } from '../utils/labels';

interface InventoryToolbarProps {
  filters: InventoryFilters;
  onChange: (filters: InventoryFilters) => void;
}

const stockOptions: { value: StockFilter; label: string }[] = [
  { value: 'all', label: 'Все продукты' },
  { value: 'low', label: 'Заканчиваются' },
  { value: 'expiring', label: 'Скоро испортятся' },
  { value: 'favorites', label: 'Избранное' },
];

export function InventoryToolbar({ filters, onChange }: InventoryToolbarProps) {
  return (
    <div className="toolbar">
      <label className="search-field">
        <Search size={18} />
        <span className="sr-only">Поиск по запасам</span>
        <input
          type="search"
          placeholder="Найти продукт…"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </label>
      <div className="filter-row">
        <select
          aria-label="Категория"
          value={filters.category}
          onChange={(event) =>
            onChange({ ...filters, category: event.target.value as InventoryFilters['category'] })
          }
        >
          <option value="All">Все категории</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {categoryLabels[category]}
            </option>
          ))}
        </select>
        <select
          aria-label="Состояние запасов"
          value={filters.stock}
          onChange={(event) => onChange({ ...filters, stock: event.target.value as StockFilter })}
        >
          {stockOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Сортировка продуктов"
          value={filters.sort}
          onChange={(event) =>
            onChange({ ...filters, sort: event.target.value as InventoryFilters['sort'] })
          }
        >
          <option value="recent">Недавно обновлённые</option>
          <option value="name">По названию</option>
          <option value="expiry">По сроку годности</option>
        </select>
      </div>
    </div>
  );
}
