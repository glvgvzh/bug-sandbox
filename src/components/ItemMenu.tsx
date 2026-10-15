import type { PantryItem } from '../types';

interface ItemMenuProps {
  item: PantryItem;
  anchor: HTMLElement;
  onEdit: (item: PantryItem) => void;
  onDelete: (item: PantryItem) => void;
  onClose: () => void;
}

export function ItemMenu({ item, anchor, onEdit, onDelete, onClose }: ItemMenuProps) {
  const rect = anchor.getBoundingClientRect();
  return (
    <>
      <button className="menu-scrim" aria-label="Закрыть меню" onClick={onClose} />
      <div className="item-menu" style={{ top: rect.bottom + 6, left: rect.right - 150 }}>
        <button onClick={() => onEdit(item)}>Изменить продукт</button>
        <button className="danger-text" onClick={() => onDelete(item)}>Удалить продукт</button>
      </div>
    </>
  );
}
