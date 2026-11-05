import { seedLeads } from '../data/leads';
import type { RestaurantLead } from '../types';

export const STORAGE_KEY = 'imagine-outreach-leads-v1';

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function loadLeads(): RestaurantLead[] {
  if (typeof window === 'undefined') return seedLeads;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedLeads;
    const saved = JSON.parse(raw) as RestaurantLead[];
    if (!Array.isArray(saved)) return seedLeads;

    const savedById = new Map(saved.map((lead) => [lead.id, lead]));
    const mergedSeeds = seedLeads.map((seed) => {
      const stored = savedById.get(seed.id);
      if (seed.origin === 'sent-import' || seed.status === 'sent') {
        return { ...seed, status: 'sent' as const, sentAt: seed.sentAt };
      }
      if (!stored) return seed;
      return {
        ...seed,
        status: stored.status === 'sent' ? 'sent' as const : 'remaining' as const,
        sentAt: stored.status === 'sent' ? stored.sentAt : undefined,
      };
    });
    const seedIds = new Set(seedLeads.map((lead) => lead.id));
    const manualLeads = saved.filter((lead) => !seedIds.has(lead.id) && lead.origin === 'manual');
    return [...mergedSeeds, ...manualLeads];
  } catch {
    return seedLeads;
  }
}

export function saveLeads(leads: RestaurantLead[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function findEmailConflict(
  leads: RestaurantLead[],
  emails: string[],
  excludeId?: string,
): { lead: RestaurantLead; email: string } | undefined {
  const candidates = new Set(emails.map(normalizeEmail));
  for (const lead of leads) {
    if (lead.id === excludeId) continue;
    const match = lead.emails.find((email) => candidates.has(normalizeEmail(email)));
    if (match) return { lead, email: match };
  }
  return undefined;
}

export function getBlockedEmails(leads: RestaurantLead[]): string[] {
  return [...new Set(
    leads
      .filter((lead) => lead.status === 'sent')
      .flatMap((lead) => lead.emails.map(normalizeEmail)),
  )].sort();
}

export function createLeadId(name: string): string {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `manual-${slug || 'restaurant'}-${Date.now()}`;
}

export function downloadCsv(leads: RestaurantLead[], filename: string): void {
  const header = ['Restaurant', 'Email', 'Status', 'Cuisine', 'Locality', 'Address', 'Phone', 'Sent date', 'Queue', 'Source'];
  const rows = leads.flatMap((lead) => lead.emails.map((email) => [
    lead.name,
    email,
    lead.status,
    lead.cuisine,
    lead.locality,
    lead.address,
    lead.phone ?? '',
    lead.sentAt ?? '',
    lead.queueGroup,
    lead.sourceUrl ?? (lead.origin === 'sent-import' ? 'Gmail SENT verified 2026-11-05' : 'User supplied'),
  ]));
  const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const csv = `\uFEFF${[header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
