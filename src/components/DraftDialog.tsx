import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, CheckCircle2, Code2, Copy, ExternalLink, FileText, Mail, Send, ShieldCheck } from 'lucide-react';
import type { RestaurantLead } from '../types';
import { generatePitch } from '../lib/pitch';
import { copyText } from '../lib/clipboard';
import { Dialog } from './Dialog';

interface DraftDialogProps {
  lead: RestaurantLead;
  onClose: () => void;
  onMarkSent: (lead: RestaurantLead) => void;
  notify: (message: string) => void;
}

type PreviewMode = 'formatted' | 'text';

export function DraftDialog({ lead, onClose, onMarkSent, notify }: DraftDialogProps) {
  const pitch = useMemo(() => generatePitch(lead), [lead]);
  const [mode, setMode] = useState<PreviewMode>('formatted');
  const [copied, setCopied] = useState<'text' | 'html' | 'subject' | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleCopy = async (kind: 'text' | 'html' | 'subject') => {
    const value = kind === 'text' ? pitch.text : kind === 'html' ? pitch.html : pitch.subject;
    await copyText(value);
    setCopied(kind);
    notify(kind === 'subject' ? 'Subject copied' : kind === 'html' ? 'HTML pitch copied with approved signature' : 'Plain text pitch copied');
    window.setTimeout(() => setCopied(null), 1800);
  };

  return (
    <Dialog title={lead.name} eyebrow="Tailored email draft" onClose={onClose} wide>
      <div className="draft-meta">
        <div className="draft-recipient">
          <Mail size={15} />
          <span>To</span>
          <strong>{lead.emails.join(', ')}</strong>
        </div>
        {lead.sourceUrl ? (
          <a href={lead.sourceUrl} target="_blank" rel="noreferrer" className="source-link">
            Public email source <ExternalLink size={12} />
          </a>
        ) : (
          <span className="source-note">Lead provided by you</span>
        )}
      </div>

      <div className="draft-subject">
        <div>
          <span>Subject</span>
          <strong>{pitch.subject}</strong>
        </div>
        <button type="button" className="icon-button" onClick={() => handleCopy('subject')} aria-label="Copy subject">
          {copied === 'subject' ? <Check size={17} /> : <Copy size={16} />}
        </button>
      </div>

      <div className="draft-toolbar">
        <div className="preview-tabs" role="tablist" aria-label="Draft preview format">
          <button type="button" role="tab" aria-selected={mode === 'formatted'} className={mode === 'formatted' ? 'active' : ''} onClick={() => setMode('formatted')}>
            <FileText size={14} /> Preview
          </button>
          <button type="button" role="tab" aria-selected={mode === 'text'} className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>
            <Code2 size={14} /> Plain text
          </button>
        </div>
        <span className="safe-format"><ShieldCheck size={14} /> Approved signature included</span>
      </div>

      <div className={`email-preview ${mode === 'text' ? 'email-preview--text' : ''}`}>
        {mode === 'formatted' ? (
          <div className="email-paper" dangerouslySetInnerHTML={{ __html: pitch.html }} />
        ) : (
          <pre>{pitch.text}</pre>
        )}
      </div>

      <div className="draft-notice">
        <ShieldCheck size={16} />
        <span>Nothing sends from this dashboard. Gmail opens a reviewable compose window.</span>
      </div>

      {confirming ? (
        <div className="sent-confirmation">
          <div>
            <strong>Has this pitch appeared in Gmail Sent?</strong>
            <span>This adds every recipient to your permanent blocklist.</span>
          </div>
          <div className="sent-confirmation__actions">
            <button type="button" className="button button--ghost" onClick={() => setConfirming(false)}>Cancel</button>
            <button type="button" className="button button--dark" onClick={() => onMarkSent(lead)}>
              <CheckCircle2 size={16} /> Yes, mark sent
            </button>
          </div>
        </div>
      ) : (
        <footer className="dialog__footer draft-footer">
          <button type="button" className="button button--ghost mark-sent-button" onClick={() => setConfirming(true)}>
            <CheckCircle2 size={16} /> Mark as sent
          </button>
          <div className="draft-footer__actions">
            <button type="button" className="button button--ghost copy-html-button" onClick={() => handleCopy('html')}>
              {copied === 'html' ? <Check size={16} /> : <Code2 size={16} />} Copy HTML
            </button>
            <button type="button" className="button button--ghost" onClick={() => handleCopy('text')}>
              {copied === 'text' ? <Check size={16} /> : <Copy size={16} />} Copy text
            </button>
            <a className="button button--primary" href={pitch.gmailUrl} target="_blank" rel="noreferrer">
              <Send size={16} /> Open in Gmail <ArrowUpRight size={14} />
            </a>
          </div>
        </footer>
      )}
    </Dialog>
  );
}
