import { useEffect } from 'react';
import { TriangleAlert as AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md card p-6 animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-4">
          <span className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${destructive ? 'bg-error-50 text-error-600' : 'bg-primary-50 text-primary-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <h2 className="font-bold text-ink-900">{title}</h2>
            <p className="mt-1.5 text-sm text-ink-600">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`btn px-4 py-2.5 text-sm font-semibold rounded-lg text-white ${destructive ? 'bg-error-600 hover:bg-error-700 active:bg-error-800' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
