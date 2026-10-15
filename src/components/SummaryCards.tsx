import { AlertTriangle, PackageOpen, Timer } from 'lucide-react';

interface SummaryCardsProps {
  total: number;
  low: number;
  expiring: number;
  onSelect: (filter: 'all' | 'low' | 'expiring') => void;
}

export function SummaryCards({ total, low, expiring, onSelect }: SummaryCardsProps) {
  return (
    <section className="summary-grid" aria-label="Сводка по запасам">
      <button className="summary-card" onClick={() => onSelect('all')}>
        <span className="summary-icon green">
          <PackageOpen size={20} />
        </span>
        <span>
          <strong>{total}</strong>
          <small>Всего продуктов</small>
        </span>
      </button>
      <button className="summary-card" onClick={() => onSelect('low')}>
        <span className="summary-icon orange">
          <AlertTriangle size={20} />
        </span>
        <span>
          <strong>{low}</strong>
          <small>Заканчиваются</small>
        </span>
      </button>
      <button className="summary-card" onClick={() => onSelect('expiring')}>
        <span className="summary-icon blue">
          <Timer size={20} />
        </span>
        <span>
          <strong>{expiring}</strong>
          <small>Скоро испортятся</small>
        </span>
      </button>
    </section>
  );
}
