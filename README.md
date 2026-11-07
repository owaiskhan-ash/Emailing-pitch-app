# Imagine Outreach Dashboard

A minimal restaurant outreach dashboard for Imagine's Jogeshwari and nearby campaigns.

## Features

- 112 sent lead entries covering 117 protected email addresses: 40 original restaurants, 69 Andheri East contacts, and 3 earlier researched restaurants.
- The original 19-lead queue is fully contacted, with 0 earlier researched restaurants and 11 Andheri East contacts remaining.
- Sixty-nine Andheri East contacts were confirmed in Gmail Sent on 6 and 7 November 2026; 11 remain in the **New research** queue after 27 unsent major-chain contacts were excluded.
- Major restaurant, cafe, and QSR chains are excluded from future outreach, while historical sends remain visible and protected. Thirty unsent chain entries were removed across the queues.
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
- `src/data/leads.ts`: original seed lead data and personalized pitch inputs, with major-chain filtering applied to unsent researched leads.
- `src/data/andheriEastLeads.ts`: 80 active Andheri East entries generated from the validated 107-row research CSV, with 69 Gmail-confirmed sends and 11 leads remaining. Twenty-seven unsent major-chain contacts are excluded from future outreach.
- `outreach/andheri-east-restaurant-emails.csv` and `.md`: sourced Andheri East contact research with outlet/shared classifications.

Browser changes are stored under `imagine-outreach-leads-v1` in local storage. Original Gmail-verified sent records are always restored as sent, even if browser data is edited. Export CSV regularly for a portable backup.
