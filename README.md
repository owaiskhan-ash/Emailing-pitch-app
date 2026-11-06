# Imagine Outreach Dashboard

A minimal restaurant outreach dashboard for Imagine's Jogeshwari and nearby campaigns.

## Features

- 71 sent lead entries covering 76 protected email addresses: 40 original restaurants plus 31 Andheri East contacts.
- The original 19-lead queue is fully contacted, with 6 earlier researched restaurants and 76 Andheri East contacts remaining.
- Thirty-one Andheri East contacts were confirmed in Gmail Sent on 6 November 2026; the other 76 remain unsent in the **New research** queue.
- Compact cards, search, queue filters, campaign progress, and separate sent and blocklist views.
- Personalized plain-text and HTML pitch generation using the approved Imagine signature and hosted logo.
- Gmail compose links for review. The dashboard never sends email automatically.
- Case-insensitive duplicate prevention when adding leads.
- Browser autosave, CSV lead exports, and CSV blocklist exports.
- Responsive desktop and mobile layouts.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

The tests verify the original lead counts, protected address count, duplicate detection, required offer details, approved signature, hosted logo, and the absence of em-dashes and en-dashes in every generated email.

## Outreach records

- `outreach/emailed-restaurants.csv`: machine-readable Gmail-verified do-not-email list.
- `outreach/emailed-restaurants.md`: readable blocklist and verification notes.
- `src/data/leads.ts`: original seed lead data and personalized pitch inputs.
- `src/data/andheriEastLeads.ts`: 107 Andheri East entries generated from the validated research CSV, with 31 Gmail-confirmed sends and 76 leads remaining.
- `outreach/andheri-east-restaurant-emails.csv` and `.md`: sourced Andheri East contact research with outlet/shared classifications.

Browser changes are stored under `imagine-outreach-leads-v1` in local storage. Original Gmail-verified sent records are always restored as sent, even if browser data is edited. Export CSV regularly for a portable backup.
