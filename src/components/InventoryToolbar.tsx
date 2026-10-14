import { Search } from 'lucide-react';
import { categories, type InventoryFilters, type StockFilter } from '../types';

interface InventoryToolbarProps {
  filters: InventoryFilters;
  onChange: (filters: InventoryFilters) => void;
}

const stockOptions: { value: StockFilter; label: string }[] = [
  { value: 'all', label: 'All items' },
  { value: 'low', label: 'Low stock' },
  { value: 'expiring', label: 'Expiring soon' },
  { value: 'favorites', label: 'Favorites' },
];

export function InventoryToolbar({ filters, onChange }: InventoryToolbarProps) {
  return (
    <div className="toolbar">
      <label className="search-field">
        <Search size={18} />
        <span className="sr-only">Search inventory</span>
        <input
          type="search"
          placeholder="Search pantry…"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </label>
      <div className="filter-row">
        <select
          aria-label="Category"
          value={filters.category}
          onChange={(event) => onChange({ ...filters, category: event.target.value as InventoryFilters['category'] })}
        >
          <option>All</option>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <select
          aria-label="Stock status"
          value={filters.stock}
          onChange={(event) => onChange({ ...filters, stock: event.target.value as StockFilter })}
        >
          {stockOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select
          aria-label="Sort items"
          value={filters.sort}
          onChange={(event) => onChange({ ...filters, sort: event.target.value as InventoryFilters['sort'] })}
        >
          <option value="recent">Recently updated</option>
          <option value="name">Name A–Z</option>
          <option value="expiry">Expiry date</option>
        </select>
      </div>
    </div>
  );
}
