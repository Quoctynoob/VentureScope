'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  sectionName: string;
  sectionData: any;
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

export function EditModal({ isOpen, sectionName, sectionData, onClose, onSave }: EditModalProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText(JSON.stringify(sectionData, null, 2));
      setError('');
    }
  }, [isOpen, sectionData]);

  function handleSave() {
    try {
      const parsed = JSON.parse(text);
      onSave(parsed);
      onClose();
    } catch {
      setError('Invalid JSON — please fix the syntax before saving.');
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-[480px] bg-white z-50 flex flex-col shadow-xl border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Edit Section</p>
            <h2 className="text-base font-semibold text-slate-900">{sectionName}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden flex flex-col px-5 pt-4 pb-2 gap-3">
          <p className="text-xs text-slate-400 shrink-0">Edit the JSON below. Changes are saved directly to the memo.</p>
          <textarea
            className="flex-1 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none outline-none focus:ring-2 focus:ring-slate-300"
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            spellCheck={false}
          />
          {error && <p className="text-xs text-red-500 shrink-0">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 shrink-0">
          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-sm bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
