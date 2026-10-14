import { Cloud, CloudOff, Plus } from 'lucide-react';

interface HeaderProps {
  isSyncing: boolean;
  syncError: string | null;
  lastSyncedAt: string | null;
  onAdd: () => void;
  onSync: () => void;
  onImport: () => void;
}

export function Header({ isSyncing, syncError, lastSyncedAt, onAdd, onSync, onImport }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">P</div>
        <div>
          <h1>Pantry Pilot</h1>
          <p>Know what you have. Buy what you need.</p>
        </div>
      </div>
      <div className="header-actions">
        <div className={`sync-status ${syncError ? 'has-error' : ''}`} title={syncError ?? undefined}>
          {syncError ? <CloudOff size={16} /> : <Cloud size={16} />}
          <span>{syncError ? 'Sync issue' : lastSyncedAt ? 'Synced just now' : 'Stored locally'}</span>
        </div>
        <button className="button button-ghost" onClick={onImport}>Import CSV</button>
        <button className="button button-secondary" onClick={onSync} disabled={isSyncing}>
          {isSyncing ? 'Syncing…' : 'Sync pantry'}
        </button>
        <button className="button button-primary" onClick={onAdd}>
          <Plus size={17} /> Add item
        </button>
      </div>
    </header>
  );
}
