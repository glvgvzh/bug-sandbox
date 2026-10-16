import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { categories, type ItemDraft, type PantryItem, type Unit } from '../types';
import { categoryLabels, unitLabels } from '../utils/labels';
import { validateDraft, type DraftErrors } from '../utils/validation';

interface ItemFormModalProps {
  item: PantryItem | null;
  onClose: () => void;
  onSave: (draft: ItemDraft) => void;
}

const blankDraft: ItemDraft = {
  name: '',
  category: 'Produce',
  quantity: 1,
  unit: 'pcs',
  lowStockAt: 1,
  expiresAt: null,
  favorite: false,
};

export function ItemFormModal({ item, onClose, onSave }: ItemFormModalProps) {
  const [draft, setDraft] = useState<ItemDraft>(
    item
      ? {
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          lowStockAt: item.lowStockAt,
          expiresAt: item.expiresAt,
          favorite: item.favorite,
        }
      : blankDraft,
  );
  const [errors, setErrors] = useState<DraftErrors>({});

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSave({ ...draft, name: draft.name.trim() });
    onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Запасы</p>
            <h2 id="item-form-title">{item ? 'Изменить продукт' : 'Добавить продукт'}</h2>
          </div>
          <button className="icon-button" aria-label="Закрыть" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="item-form">
          <label className="field field-wide">
            Название продукта
            <input
              autoFocus
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>
          <label className="field">
            Категория
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value as ItemDraft['category'] })
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Единица измерения
            <select
              value={draft.unit}
              onChange={(event) => setDraft({ ...draft, unit: event.target.value as Unit })}
            >
              {(Object.entries(unitLabels) as [Unit, string][]).map(([unit, label]) => (
                <option key={unit} value={unit}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Количество
            <input
              type="number"
              min="0"
              step="any"
              value={draft.quantity}
              onChange={(event) => setDraft({ ...draft, quantity: Number(event.target.value) })}
            />
            {errors.quantity && <span className="field-error">{errors.quantity}</span>}
          </label>
          <label className="field">
            Порог малого запаса
            <input
              type="number"
              min="0"
              step="any"
              value={draft.lowStockAt}
              onChange={(event) => setDraft({ ...draft, lowStockAt: Number(event.target.value) })}
            />
            {errors.lowStockAt && <span className="field-error">{errors.lowStockAt}</span>}
          </label>
          <label className="field field-wide">
            Срок годности <span className="optional">Необязательно</span>
            <input
              type="date"
              value={draft.expiresAt ?? ''}
              onChange={(event) => setDraft({ ...draft, expiresAt: event.target.value || null })}
            />
            {errors.expiresAt && <span className="field-error">{errors.expiresAt}</span>}
          </label>
          <div className="modal-footer field-wide">
            <button type="button" className="button button-ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="button button-primary">
              {item ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
