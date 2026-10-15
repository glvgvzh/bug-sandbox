import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { ImportModal } from './components/ImportModal';
import { InventoryToolbar } from './components/InventoryToolbar';
import { ItemFormModal } from './components/ItemFormModal';
import { ItemGrid } from './components/ItemGrid';
import { ItemMenu } from './components/ItemMenu';
import { SummaryCards } from './components/SummaryCards';
import { Toast } from './components/Toast';
import { useInventory } from './hooks/useInventory';
import type { ItemDraft, PantryItem } from './types';

interface MenuState { item: PantryItem; anchor: HTMLElement }
interface ToastState { message: string; tone?: 'success' | 'error' }

export function App() {
  const inventory = useInventory();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    window.setTimeout(() => setToast(null), 3000);
  }, [toast]);

  function openAddForm() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEditForm(item: PantryItem) {
    setEditingItem(item);
    setMenu(null);
    setFormOpen(true);
  }

  function saveItem(draft: ItemDraft) {
    if (editingItem) {
      inventory.updateItem(editingItem.id, draft);
      setToast({ message: `${draft.name}: изменения сохранены` });
    } else {
      inventory.addItem(draft);
      setToast({ message: `${draft.name}: продукт добавлен` });
    }
  }

  async function deleteItem(item: PantryItem) {
    setMenu(null);
    try {
      await inventory.deleteItem(item.id);
      setToast({ message: `${item.name}: продукт удалён` });
    } catch {
      setToast({ message: `Не удалось удалить ${item.name}`, tone: 'error' });
    }
  }

  return (
    <div className="app-shell">
      <Header
        isSyncing={inventory.isSyncing}
        syncError={inventory.syncError}
        lastSyncedAt={inventory.lastSyncedAt}
        onAdd={openAddForm}
        onImport={() => setImportOpen(true)}
        onSync={() => void inventory.sync()}
      />
      <main>
        <div className="page-intro">
          <div><p className="eyebrow">Домашние запасы</p><h2>Ваша кладовая</h2></div>
          <p>Следите за запасами продуктов и вовремя пополняйте их.</p>
        </div>
        <SummaryCards
          {...inventory.summary}
          onSelect={(stock) => inventory.setFilters({ ...inventory.filters, stock })}
        />
        <InventoryToolbar filters={inventory.filters} onChange={inventory.setFilters} />
        <ItemGrid
          items={inventory.visibleItems}
          onOpen={openEditForm}
          onFavorite={inventory.toggleFavorite}
          onMenu={(item, anchor) => setMenu({ item, anchor })}
        />
      </main>

      {formOpen && (
        <ItemFormModal
          item={editingItem}
          onClose={() => setFormOpen(false)}
          onSave={saveItem}
        />
      )}
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} onImport={inventory.importItems} />}
      {menu && <ItemMenu {...menu} onEdit={openEditForm} onDelete={(item) => void deleteItem(item)} onClose={() => setMenu(null)} />}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
