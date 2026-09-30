# Princeton Alumni Angels website

A fast static site (no Squarespace, no database) that keeps itself current. Content lives in small data files and, optionally, in a Google Sheet and a shared calendar, so volunteers never touch HTML.

## Pages

| Page | File | Audience |
|---|---|---|
| Home | `index.html` | Everyone: stats, three "doors", live news and events, portfolio, mailing list |
| Founders | `founders.html` | What we look for, 5-step process, founder dates, FAQ, apply |
| Investors | `investors.html` | Eligibility, why a group, diligence process, market data, FAQ, join |
| Community | `community.html` | Events calendar, four ways to get involved, ecosystem partners, LinkedIn |

Every page ends with the mailing list signup and the same footer.

## What updates on its own

| Content | How it updates | Manual work |
|---|---|---|
| **Portfolio news** | A GitHub Action runs every morning, searches Google News for each company in `data/portfolio.json`, and rewrites `data/news.json`. | None. To keep a story permanently, add it to `data/news-pinned.json`. |
| **Events** | Put a public calendar link (Google Calendar or Luma `.ics`) in `data/site.json` → `sources.events.ics`. The same nightly job turns it into `data/events.json`. Past events move to "Recent" automatically. | Add events to the calendar you already use. Tag the audience by writing `#founders`, `#investors` or `#community` in the event description. |
| **Stats, buttons, emails** | `data/site.json` | Change a number once; it updates on every page. |
| **LinkedIn** | `data/linkedin.json` (paste post text + link), or set `linkedin.mode` to `"embed"` and add the post's `urn` to show LinkedIn's own embed. | About a minute per post. LinkedIn has no free public feed API; if PAA wants zero-touch, a widget service such as SociableKit or Elfsight can replace this list. |
| **Portfolio** | `data/portfolio.json` | Add a company when a deal closes. |

### Prefer a spreadsheet?
Any list can come from a Google Sheet instead of a JSON file. Create a sheet with the same column names as the JSON fields (for events: `title, date, end, location, audience, description, url`), then **File → Share → Publish to web → CSV**, and paste that link into `data/site.json` under `sources.<list>.csv`. The site reads the sheet live, and falls back to the JSON file if the sheet can't be reached.

## Mailing list and "join" buttons
- **Mailing list:** create a free form endpoint (Formspree, or a Mailchimp/Buttondown embedded form URL) and paste it into `data/site.json` → `mailingList.endpoint`. Until then, the form shows a "preview only" note and sends nothing.
- **Apply to pitch / Apply for membership:** paste the Google Form or application links into `links.founderApply` and `links.investorJoin`. Until then those buttons open an email to the startups and investors inboxes.

## Deploying on GitHub Pages
1. Create a GitHub account and a new repository (for example `paa-website`), then upload everything in this folder.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. **Settings → Actions → General → Workflow permissions:** "Read and write" (lets the nightly job save news).
4. The `Deploy site` workflow publishes the site on every change. The `Refresh news and events` workflow runs daily; use **Actions → Run workflow** to run it on demand.
5. Custom domain: **Settings → Pages → Custom domain** → `www.princetonalumniangels.org`, then update the domain's DNS as GitHub instructs.

## Editing shared parts
Header, footer and newsletter live once in `src/partials/`. Page content lives in `src/pages/`. Run `python build.py` (or let the deploy workflow do it) to regenerate `dist/`.

## Before launch
- Confirm the portfolio list and sectors with the PAA team (the seed list came from public databases).
- Replace the example events (marked "Example" on the site) or connect the calendar.
- Imagery: the design uses no photographs of campus buildings. Do not add Nassau Hall or Blair Arch images or the University shield; use portfolio founder photos or event photos PAA owns instead.
