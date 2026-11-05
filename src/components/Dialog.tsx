import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export function Dialog({ title, eyebrow, onClose, children, wide = false }: DialogProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`dialog ${wide ? 'dialog--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <header className="dialog__header">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 id="dialog-title">{title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog" autoFocus>
            <X size={19} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
