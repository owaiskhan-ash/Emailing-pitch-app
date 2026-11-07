import { describe, expect, it } from 'vitest';
import { queuedLeads, researchedLeads, seedLeads, sentLeads } from '../data/leads';
import { andheriEastLeads, isExcludedFutureChain } from '../data/andheriEastLeads';
import { APPROVED_HTML_SIGNATURE, generatePitch, hasForbiddenDash } from './pitch';
import { findEmailConflict, getBlockedEmails } from './leads';

const remaining = [...queuedLeads, ...researchedLeads, ...andheriEastLeads];

describe('outreach data', () => {
  it('preserves the original sent records and protects 41 Andheri East sends', () => {
    expect(sentLeads).toHaveLength(18);
    expect(seedLeads.filter((lead) => lead.status === 'sent')).toHaveLength(81);
    expect(andheriEastLeads.filter((lead) => lead.status === 'sent')).toHaveLength(41);
    expect(getBlockedEmails(seedLeads)).toHaveLength(86);
  });

  it('keeps the original queue and tracks 80 active Andheri East contacts', () => {
    expect(queuedLeads).toHaveLength(19);
    expect(researchedLeads).toHaveLength(6);
    expect(andheriEastLeads).toHaveLength(80);
    expect(remaining).toHaveLength(105);
    expect(remaining.filter((lead) => lead.status === 'remaining')).toHaveLength(42);
    expect(andheriEastLeads.every((lead) => lead.origin === 'researched')).toBe(true);
    expect(andheriEastLeads.every((lead) => lead.queueGroup === 'New research')).toBe(true);
    expect(andheriEastLeads.filter((lead) => lead.status === 'remaining')).toHaveLength(39);
    expect(andheriEastLeads.filter((lead) => lead.status === 'sent')).toHaveLength(41);
    expect(andheriEastLeads.every((lead) => lead.sentAt ? lead.status === 'sent' : lead.status === 'remaining')).toBe(true);
    expect(andheriEastLeads.every((lead) => lead.sourceUrl && lead.pitch)).toBe(true);
    expect(seedLeads).toHaveLength(123);
  });

  it('excludes major chains from future outreach without deleting sent history', () => {
    const futureLeads = seedLeads.filter((lead) => lead.status === 'remaining');
    expect(futureLeads.some((lead) => isExcludedFutureChain(lead.name))).toBe(false);
    expect(andheriEastLeads.some((lead) => lead.id === 'andheri-east-086')).toBe(false);
    expect(andheriEastLeads.find((lead) => lead.id === 'andheri-east-041')?.status).toBe('sent');
    expect(andheriEastLeads.find((lead) => lead.id === 'andheri-east-042')?.status).toBe('remaining');
    expect(researchedLeads.some((lead) => lead.id === 'punjab-grill-infiniti')).toBe(false);
    expect(researchedLeads.some((lead) => lead.id === 'mainland-china-andheri')).toBe(false);
    expect(researchedLeads.some((lead) => lead.id === 'irish-house-andheri')).toBe(false);
    expect(andheriEastLeads.filter((lead) => lead.status === 'sent' && isExcludedFutureChain(lead.name))).toHaveLength(12);
    expect(researchedLeads.find((lead) => lead.id === 'youmee-infiniti')?.status).toBe('sent');
  });

  it('has no duplicate email addresses or lead IDs across seed leads', () => {
    const emails = seedLeads.flatMap((lead) => lead.emails.map((email) => email.toLowerCase()));
    const ids = seedLeads.map((lead) => lead.id);
    expect(new Set(emails).size).toBe(emails.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('matches blocklisted addresses case-insensitively', () => {
    const conflict = findEmailConflict(seedLeads, ['KINGSFUSIONFOOD@gmail.com']);
    expect(conflict?.lead.name).toBe('Grills & WOK');
  });
});

describe('pitch generator', () => {
  it.each(remaining.map((lead) => [lead.id, lead] as const))('creates a complete, safe pitch for %s', (_id, lead) => {
    const pitch = generatePitch(lead);
    expect(pitch.subject).toContain(lead.name);
    expect(pitch.text).toContain('a server that never goes down');
    expect(pitch.text).toContain('₹0 Build / Setup Cost');
    expect(pitch.text).toContain('Flat ₹2,500/- per month');
    expect(pitch.text).toContain('quick 5-minute demo');
    expect(pitch.text).toContain('+91 98197 08112');
    expect(pitch.text).toContain(lead.pitch?.caseStudy);
    expect(pitch.html.endsWith(APPROVED_HTML_SIGNATURE)).toBe(true);
    expect(pitch.html).toContain('https://imagine.justsimpleapps.online/assets/imagine-logo.png');
    expect(hasForbiddenDash(pitch.subject)).toBe(false);
    expect(hasForbiddenDash(pitch.text)).toBe(false);
    expect(hasForbiddenDash(pitch.html)).toBe(false);
  });

  it('avoids repeated menu wording in tailored offers', () => {
    const facingEast = queuedLeads.find((lead) => lead.id === 'facing-east')!;
    const aromas = queuedLeads.find((lead) => lead.id === 'aromas-cafe-bistro')!;
    expect(generatePitch(facingEast).text).toContain('tailored to your exact menu and table workflow');
    expect(generatePitch(aromas).text).toContain('tailored to your exact all-day menu and table workflow');
  });

  it('creates a Gmail compose link without sending', () => {
    const pitch = generatePitch(queuedLeads[0]);
    expect(pitch.gmailUrl).toContain('mail.google.com/mail/');
    expect(pitch.gmailUrl).toContain('view=cm');
    expect(pitch.gmailUrl).toContain('to=info%40yokosizzlers.com');
  });
});
