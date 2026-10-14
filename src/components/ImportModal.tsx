import { useState, type FormEvent } from 'react';
import { Upload, X } from 'lucide-react';
import type { ItemDraft } from '../types';
import { parseInventoryCsv } from '../utils/csv';

interface ImportModalProps {
  onClose: () => void;
  onImport: (drafts: ItemDraft[]) => void;
}

export function ImportModal({ onClose, onImport }: ImportModalProps) {
  const [source, setSource] = useState('name,category,quantity,unit,lowStockAt,expiresAt\n');
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const drafts = parseInventoryCsv(source);
      onImport(drafts);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not read the CSV');
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal compact" role="dialog" aria-modal="true" aria-labelledby="import-title">
        <div className="modal-header">
          <div><p className="eyebrow">Bulk update</p><h2 id="import-title">Import inventory</h2></div>
          <button className="icon-button" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={submit}>
          <p className="helper-text">Paste comma-separated rows using the template below.</p>
          <textarea aria-label="CSV data" rows={8} value={source} onChange={(event) => setSource(event.target.value)} />
          {error && <p className="form-alert">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="button button-ghost" onClick={onClose}>Cancel</button>
            <button className="button button-primary" type="submit"><Upload size={17} /> Import</button>
          </div>
        </form>
      </div>
    </div>
  );
}
