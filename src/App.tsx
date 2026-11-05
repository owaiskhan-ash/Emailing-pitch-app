import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  LayoutDashboard,
  MailCheck,
  Plus,
  Search,
  Send,
  ShieldBan,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import { AddLeadDialog } from './components/AddLeadDialog';
import { DraftDialog } from './components/DraftDialog';
import { LeadCard } from './components/LeadCard';
import { createLeadId, downloadCsv, findEmailConflict, getBlockedEmails, isValidEmail, loadLeads, normalizeEmail, saveLeads } from './lib/leads';
import type { DashboardView, NewLeadInput, QueueGroup, RestaurantLead } from './types';

type QueueFilter = 'All' | QueueGroup;

const viewCopy: Record<DashboardView, { title: string; subtitle: string }> = {
  overview: { title: 'Restaurant outreach', subtitle: 'Every pitch, every lead, one clear view.' },
  remaining: { title: 'Remaining leads', subtitle: 'Review a tailored pitch when you are ready.' },
  sent: { title: 'Sent pitches', subtitle: 'Your contacted restaurants, checked and protected.' },
  blocklist: { title: 'Do-not-email blocklist', subtitle: 'Every sent address is protected from duplicate outreach.' },
};

function matchesQuery(lead: RestaurantLead, query: string): boolean {
  if (!query) return true;
  const haystack = [lead.name, lead.cuisine, lead.locality, lead.address, ...lead.emails].join(' ').toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function formatDate(value?: string): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

export default function App() {
  const [leads, setLeads] = useState<RestaurantLead[]>(loadLeads);
  const [view, setView] = useState<DashboardView>('overview');
  const [query, setQuery] = useState('');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('All');
  const [selectedLead, setSelectedLead] = useState<RestaurantLead | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => saveLeads(leads), [leads]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const sentLeads = useMemo(() => leads.filter((lead) => lead.status === 'sent'), [leads]);
  const remainingLeads = useMemo(() => leads.filter((lead) => lead.status === 'remaining'), [leads]);
  const blockedEmails = useMemo(() => getBlockedEmails(leads), [leads]);
  const progress = leads.length ? Math.round((sentLeads.length / leads.length) * 100) : 0;
  const nextBatchGroup = (['Batch 1', 'Batch 2', 'New research', 'Manual'] as QueueGroup[]).find((group) =>
    remainingLeads.some((lead) => lead.queueGroup === group),
  ) ?? 'Batch 1';
  const nextBatchCount = remainingLeads.filter((lead) => lead.queueGroup === nextBatchGroup).length;
  const originalRemainingCount = remainingLeads.filter((lead) => lead.origin === 'original-queue').length;
  const researchedRemainingCount = remainingLeads.filter((lead) => lead.origin === 'researched').length;
  const manualCount = remainingLeads.filter((lead) => lead.queueGroup === 'Manual').length;

  const filteredRemaining = useMemo(() => remainingLeads.filter((lead) =>
    matchesQuery(lead, query) && (queueFilter === 'All' || lead.queueGroup === queueFilter),
  ), [remainingLeads, query, queueFilter]);
  const filteredSent = useMemo(() => sentLeads.filter((lead) => matchesQuery(lead, query)), [sentLeads, query]);
  const searchResults = useMemo(() => leads.filter((lead) => matchesQuery(lead, query)), [leads, query]);

  const notify = (message: string) => setToast(message);
  const navigate = (nextView: DashboardView) => {
    setView(nextView);
    setQuery('');
    if (nextView !== 'remaining') setQueueFilter('All');
  };
  const showQueue = (filter: QueueFilter) => {
    setQueueFilter(filter);
    setQuery('');
    setView('remaining');
  };

  const markSent = (lead: RestaurantLead) => {
    const sentAt = new Date().toISOString().slice(0, 10);
    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status: 'sent', sentAt } : item));
    setSelectedLead(null);
    notify(`${lead.name} marked as sent and added to the blocklist`);
  };

  const addLead = (input: NewLeadInput): string | null => {
    if (!input.name || !input.cuisine || !input.locality || !input.address) return 'Please complete all required fields.';
    if (!input.emails.length) return 'Add at least one email address.';
    const invalid = input.emails.find((email) => !isValidEmail(email));
    if (invalid) return `${invalid} does not look like a valid email address.`;
    const normalized = input.emails.map(normalizeEmail);
    if (new Set(normalized).size !== normalized.length) return 'Remove the duplicate address from this restaurant.';

    const conflict = findEmailConflict(leads, input.emails);
    if (conflict) {
      return conflict.lead.status === 'sent'
        ? `${conflict.email} is protected in the blocklist for ${conflict.lead.name}. No duplicate can be added.`
        : `${conflict.email} is already in the remaining queue for ${conflict.lead.name}.`;
    }

    const newLead: RestaurantLead = {
      ...input,
      id: createLeadId(input.name),
      status: 'remaining',
      origin: 'manual',
      queueGroup: 'Manual',
    };
    setLeads((current) => [...current, newLead]);
    setQueueFilter('Manual');
    setView('remaining');
    setQuery('');
    notify(`${input.name} added to remaining leads`);
    return null;
  };

  const exportLeads = (items: RestaurantLead[], filename: string, message: string) => {
    downloadCsv(items, filename);
    notify(message);
  };

  const renderLeadGrid = (items: RestaurantLead[]) => (
    <div className="lead-grid">
      {items.map((lead) => <LeadCard key={lead.id} lead={lead} onReview={setSelectedLead} />)}
    </div>
  );

  const emptyState = (
    <div className="empty-state">
      <Search size={24} />
      <h3>No restaurants found</h3>
      <p>Try another name, email, cuisine, or locality.</p>
      {query && <button type="button" className="button button--ghost" onClick={() => setQuery('')}>Clear search</button>}
    </div>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <a className="brand" href="https://imagine.justsimpleapps.online/" target="_blank" rel="noreferrer" aria-label="Imagine website">
            imagine<span>.</span>
          </a>
          <p>OUTREACH DESK</p>
        </div>

        <nav className="side-nav" aria-label="Dashboard navigation">
          <button type="button" className={view === 'overview' ? 'active' : ''} onClick={() => navigate('overview')}>
            <LayoutDashboard size={17} /><span>Overview</span>
          </button>
          <button type="button" className={view === 'remaining' ? 'active' : ''} onClick={() => navigate('remaining')}>
            <Clock3 size={17} /><span>Remaining</span><b>{remainingLeads.length}</b>
          </button>
          <button type="button" className={view === 'sent' ? 'active' : ''} onClick={() => navigate('sent')}>
            <MailCheck size={17} /><span>Sent pitches</span><b>{sentLeads.length}</b>
          </button>
          <button type="button" className={view === 'blocklist' ? 'active' : ''} onClick={() => navigate('blocklist')}>
            <ShieldBan size={17} /><span>Blocklist</span><b>{blockedEmails.length}</b>
          </button>
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-campaign">
          <div className="sidebar-campaign__icon"><Store size={17} /></div>
          <p>Campaign 01</p>
          <strong>Jogeshwari & nearby</strong>
          <div className="mini-progress"><span style={{ width: `${progress}%` }} /></div>
          <small>{sentLeads.length} of {leads.length} contacted</small>
        </div>
        <div className="gmail-account">
          <div className="gmail-avatar">AK</div>
          <div>
            <strong>ashketchupkeke</strong>
            <span><i /> Gmail verified</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div className="page-title">
            <p className="eyebrow">IMAGINE / OUTREACH</p>
            <h1>{viewCopy[view].title}</h1>
            <p>{viewCopy[view].subtitle}</p>
          </div>
          <div className="header-actions">
            <label className="search-box">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search restaurants" aria-label="Search restaurants" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}
            </label>
            <button type="button" className="button button--ghost export-button" onClick={() => exportLeads(leads, 'imagine-outreach-leads.csv', 'Complete lead list exported')}>
              <Download size={16} /><span>Export</span>
            </button>
            <button type="button" className="button button--primary add-button" onClick={() => setAddOpen(true)}>
              <Plus size={17} /><span>Add restaurant</span>
            </button>
          </div>
        </header>

        <div className="mobile-search search-box">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, cuisine, or locality" aria-label="Search restaurants mobile" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}
        </div>

        {view === 'overview' && (
          <>
            <section className="stats-grid" aria-label="Outreach summary">
              <button type="button" className="stat-card" onClick={() => navigate('sent')}>
                <div className="stat-card__icon stat-card__icon--green"><Send size={17} /></div>
                <div><span>Sent pitches</span><strong>{sentLeads.length}</strong><small>{blockedEmails.length} protected emails</small></div>
                <ArrowRight size={16} className="stat-arrow" />
              </button>
              <button type="button" className="stat-card" onClick={() => navigate('remaining')}>
                <div className="stat-card__icon stat-card__icon--orange"><Clock3 size={17} /></div>
                <div><span>Remaining</span><strong>{remainingLeads.length}</strong><small>{originalRemainingCount > 0 ? `${originalRemainingCount} original + ` : ''}{researchedRemainingCount} researched{manualCount ? ` + ${manualCount} manual` : ''}</small></div>
                <ArrowRight size={16} className="stat-arrow" />
              </button>
              <button type="button" className="stat-card" onClick={() => navigate('remaining')}>
                <div className="stat-card__icon"><FileText size={17} /></div>
                <div><span>Drafts ready</span><strong>{remainingLeads.length}</strong><small>Tailored to each outlet</small></div>
                <ArrowRight size={16} className="stat-arrow" />
              </button>
            </section>

            <section className="progress-panel">
              <div className="progress-panel__summary">
                <span>Campaign progress</span>
                <strong>{sentLeads.length} <small>of</small> {leads.length} <small>contacted</small></strong>
              </div>
              <div className="progress-panel__bar">
                <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
                <small>{progress}% complete</small>
              </div>
              <div className="next-batch">
                <div><span>Your next batch: {nextBatchGroup}</span><strong>{nextBatchCount} pitches waiting</strong></div>
                <button type="button" onClick={() => showQueue(nextBatchGroup)}>Review batch <ArrowRight size={14} /></button>
              </div>
            </section>

            {query ? (
              <section className="content-section">
                <div className="section-heading">
                  <div><h2>Search results</h2><p>{searchResults.length} restaurants match “{query}”</p></div>
                  <button type="button" className="text-button" onClick={() => setQuery('')}>Clear search <X size={14} /></button>
                </div>
                {searchResults.length ? renderLeadGrid(searchResults) : emptyState}
              </section>
            ) : (
              <>
                <section className="content-section">
                  <div className="section-heading">
                    <div><h2>Next in queue</h2><p>Your next tailored drafts, ready to review</p></div>
                    <button type="button" className="text-button" onClick={() => navigate('remaining')}>View all {remainingLeads.length} <ArrowRight size={14} /></button>
                  </div>
                  {renderLeadGrid(remainingLeads.slice(0, 6))}
                </section>
                <section className="content-section content-section--sent">
                  <div className="section-heading">
                    <div><h2>Recently sent</h2><p>Confirmed in Gmail on 5 Nov 2026</p></div>
                    <button type="button" className="text-button" onClick={() => navigate('sent')}>View all {sentLeads.length} <ArrowRight size={14} /></button>
                  </div>
                  {renderLeadGrid([...sentLeads].reverse().slice(0, 6))}
                </section>
              </>
            )}
          </>
        )}

        {view === 'remaining' && (
          <section className="content-section content-section--page">
            <div className="queue-toolbar">
              <div className="filter-pills" aria-label="Filter remaining queue">
                {(['All', 'Batch 1', 'Batch 2', 'New research', 'Manual'] as QueueFilter[]).map((filter) => {
                  const count = filter === 'All' ? remainingLeads.length : remainingLeads.filter((lead) => lead.queueGroup === filter).length;
                  if (filter === 'Manual' && count === 0) return null;
                  return <button key={filter} type="button" className={queueFilter === filter ? 'active' : ''} onClick={() => setQueueFilter(filter)}>{filter}<span>{count}</span></button>;
                })}
              </div>
              <span className="draft-ready-note"><FileText size={14} /> {filteredRemaining.length} tailored drafts</span>
            </div>
            {filteredRemaining.length ? renderLeadGrid(filteredRemaining) : emptyState}
          </section>
        )}

        {view === 'sent' && (
          <section className="content-section content-section--page">
            <div className="page-info-bar">
              <div><CheckCircle2 size={17} /><span><strong>{sentLeads.length} restaurants contacted</strong> across {blockedEmails.length} email addresses</span></div>
              <small>Gmail SENT checked 5 Nov 2026</small>
            </div>
            {filteredSent.length ? renderLeadGrid([...filteredSent].reverse()) : emptyState}
          </section>
        )}

        {view === 'blocklist' && (
          <section className="content-section content-section--page">
            <div className="blocklist-hero">
              <div className="blocklist-hero__icon"><ShieldCheck size={23} /></div>
              <div><h2>{blockedEmails.length} protected addresses</h2><p>Matching is case-insensitive. Marking a pitch sent adds its recipients here automatically.</p></div>
              <button type="button" className="button button--ghost" onClick={() => exportLeads(sentLeads, 'imagine-do-not-email-blocklist.csv', 'Do-not-email blocklist exported')}><Download size={15} /> Export blocklist</button>
            </div>
            {filteredSent.length ? (
              <div className="blocklist-grid">
                {[...filteredSent].reverse().flatMap((lead) => lead.emails.map((email) => (
                  <div className="blocklist-item" key={`${lead.id}-${email}`}>
                    <span className="blocklist-check"><Check size={13} strokeWidth={3} /></span>
                    <div><strong>{email}</strong><span>{lead.name}{lead.sentAt ? ` · ${formatDate(lead.sentAt)}` : ''}</span></div>
                    {lead.bounced && <b>Bounced</b>}
                  </div>
                )))}
              </div>
            ) : emptyState}
          </section>
        )}

        <footer className="app-footer">
          <span><ShieldCheck size={13} /> Changes save automatically in this browser.</span>
          <span>Export CSV for a portable backup.</span>
        </footer>
      </main>

      {selectedLead && <DraftDialog lead={selectedLead} onClose={() => setSelectedLead(null)} onMarkSent={markSent} notify={notify} />}
      {addOpen && <AddLeadDialog onClose={() => setAddOpen(false)} onAdd={addLead} />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  );
}
