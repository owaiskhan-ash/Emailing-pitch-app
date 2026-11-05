import { ArrowUpRight, Check, Mail, MapPin } from 'lucide-react';
import type { RestaurantLead } from '../types';

interface LeadCardProps {
  lead: RestaurantLead;
  onReview: (lead: RestaurantLead) => void;
}

export function LeadCard({ lead, onReview }: LeadCardProps) {
  const isSent = lead.status === 'sent';
  return (
    <article className={`lead-card ${isSent ? 'lead-card--sent' : ''}`}>
      <div className="lead-card__topline">
        <span className={`queue-label ${isSent ? 'queue-label--sent' : ''}`}>
          {isSent ? <Check size={12} strokeWidth={3} /> : <span className="queue-dot" />}
          {isSent ? 'Pitch sent' : lead.queueGroup}
        </span>
        {lead.bounced && <span className="bounced-label">Bounced</span>}
        {lead.origin === 'researched' && !isSent && <span className="new-label">New</span>}
      </div>
      <h3 title={lead.name}>{lead.name}</h3>
      <p className="lead-card__cuisine" title={lead.cuisine}>{lead.cuisine}</p>
      <div className="lead-card__meta">
        <MapPin size={13} />
        <span>{lead.locality}</span>
      </div>
      <div className="lead-card__footer">
        <div className="lead-card__email" title={lead.emails.join(', ')}>
          <Mail size={13} />
          <span>{lead.emails[0]}</span>
          {lead.emails.length > 1 && <b>+{lead.emails.length - 1}</b>}
        </div>
        {!isSent && (
          <button type="button" className="review-link" onClick={() => onReview(lead)} aria-label={`Review pitch for ${lead.name}`}>
            Review <ArrowUpRight size={14} />
          </button>
        )}
      </div>
    </article>
  );
}
