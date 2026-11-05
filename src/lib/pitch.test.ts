import { describe, expect, it } from 'vitest';
import { queuedLeads, researchedLeads, seedLeads, sentLeads } from '../data/leads';
import { APPROVED_HTML_SIGNATURE, generatePitch, hasForbiddenDash } from './pitch';
import { findEmailConflict, getBlockedEmails } from './leads';

const remaining = [...queuedLeads, ...researchedLeads];

describe('outreach data', () => {
  it('contains the original 18 imports and 33 total sent restaurants with 38 protected addresses', () => {
    expect(sentLeads).toHaveLength(18);
    expect(seedLeads.filter((lead) => lead.status === 'sent')).toHaveLength(33);
    expect(getBlockedEmails(seedLeads)).toHaveLength(38);
  });

  it('keeps the original queue and researched queue complete', () => {
    expect(queuedLeads).toHaveLength(19);
    expect(researchedLeads).toHaveLength(9);
    expect(remaining).toHaveLength(28);
    expect(remaining.filter((lead) => lead.status === 'remaining')).toHaveLength(13);
  });

  it('has no duplicate email addresses across seed leads', () => {
    const emails = seedLeads.flatMap((lead) => lead.emails.map((email) => email.toLowerCase()));
    expect(new Set(emails).size).toBe(emails.length);
  });

  it('matches blocklisted addresses case-insensitively', () => {
    const conflict = findEmailConflict(seedLeads, ['KINGSFUSIONFOOD@gmail.com']);
    expect(conflict?.lead.name).toBe('Grills & WOK');
  });
});

describe('pitch generator', () => {
  it.each(remaining.map((lead) => [lead.name, lead] as const))('creates a complete, safe pitch for %s', (_name, lead) => {
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
