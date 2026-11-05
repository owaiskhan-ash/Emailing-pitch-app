export type LeadStatus = 'remaining' | 'sent';
export type LeadOrigin = 'sent-import' | 'original-queue' | 'researched' | 'manual';
export type QueueGroup = 'Batch 1' | 'Batch 2' | 'New research' | 'Manual';

export interface PitchDetails {
  opening: string;
  posType: string;
  workflow: string;
  reliability: string;
  featureTitle: string;
  features: string;
  uptime: string;
  caseStudy: 'Food Inn POS' | 'PoppyBlue POS';
  demoLocation: string;
}

export interface RestaurantLead {
  id: string;
  name: string;
  emails: string[];
  cuisine: string;
  locality: string;
  address: string;
  phone?: string;
  status: LeadStatus;
  sentAt?: string;
  bounced?: boolean;
  origin: LeadOrigin;
  queueGroup: QueueGroup;
  sourceUrl?: string;
  pitch?: PitchDetails;
}

export type DashboardView = 'overview' | 'remaining' | 'sent' | 'blocklist';

export interface NewLeadInput {
  name: string;
  emails: string[];
  cuisine: string;
  locality: string;
  address: string;
  phone?: string;
}
