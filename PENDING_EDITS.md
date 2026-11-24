# Pending website edits

Edits waiting on information from Gia, Rob, Laurence or the PAA team. Each item says what's needed and what changes once it arrives.
Last updated: Nov 24, 2026 (after the 11/23 meeting).

## Waiting on info

| # | Edit | What we need | From | What happens once we have it |
|---|---|---|---|---|
| 1 | **Connect the mailing list to Mailchimp** | The Mailchimp embedded-form link: Mailchimp → Audience → Signup forms → Embedded form; copy the `action="https://….list-manage.com/subscribe/post?u=…&id=…"` URL. Also: does the audience have a ROLE field (Curious / Investing / Founder)? | Laurence (via Rob) | Paste the URL into `mailingList.endpoint` in `dist/data/site.json`. The site is already set up for Mailchimp, so signups on every page go straight into the list. |
| 2 | **Event-hosting contact** | Who gets "Plan or host an event" inquiries: Rob, Gia or a shared address? | Rob / Gia | Point the "Get in touch" links (homepage + Community "Host" card) at that email. Today they open an email to investors@princetonangels.org. |
| 3 | **Deal-screening volunteer contact** | Who should "Volunteer to screen" go to? | Rob / Gia | Same as above; today it goes to investors@princetonangels.org. |
| 4 | **Portfolio audit** | Rob to remove companies that went out of business and confirm exits. | Rob | Set `status` to `defunct` (hidden) or `exited` (Exit badge) in `dist/data/portfolio.json`. |
| 5 | **2025 stats refresh** | Updated investor and startup counts (300+ investors, 60+ startups, 33%+ women-led, 35+ pitch events, $18M+, 7 exits). | Rob with Jun | Change once in `stats` in `site.json`; every page updates. |
| 6 | **Investors page market data** | Updated Angel Capital Association sector figures (AI is now ~40% of angel investment by volume) and source year. | Rob / Jun | Update the "Top sectors" chart and tiles on the Investors page. |
| 7 | **Portfolio sectors** | Team review of the draft sector buckets. 16 companies have no sector yet: Susterre Technologies, Round21, Landsdowne Labs, BACCH Labs, Bluewave Technologies, PureLi, Integrated Reality Labs, Soliome, Limax, Measure Studio, Auggie, CarbonBridge, Duet, Flourish Care, Green Energy, Mothership Materials (and check Kubik under Climate & cleantech). | Gia / Rob | Update `sector` in `portfolio.json`; filters update automatically. |
| 8 | **Portfolio websites and logos** | Each company's website (or a master list with websites). | Rob | Add `website` and a logo per company; logos link to their sites. |
| 9 | **Portfolio count** | The Angel 101 deck says 62 investments but lists 61 names. Which company was funded twice, or is one missing? | Rob | Add the missing company if there is one. |
| 10 | **Public portfolio companies** | Which portfolio companies are publicly traded? Only NRx Pharma is marked now. | Rob | Set `"public": true` in `portfolio.json`; the nightly job adds their news. |
| 11 | **Confirm the Gust link** | Check that `gust.com/organizations/princeton-alumni-angels/member_landing` is the right page for founders to apply. | Diane / Rob | If not, swap `links.founderApply`; every "Apply for consideration" button updates. |
| 12 | **LinkedIn embed** (later) | LinkedIn page admin access. | Gia | Switch `linkedin.mode` to `"embed"` and add posts to `dist/data/linkedin.json`. |

## Dropped (decided at the 11/23 meeting)
- **Events section and Google Calendar feed:** removed entirely; too manual to maintain.
- **"Join as an investor" onboarding:** no formal process, so those buttons now go to the mailing list.

## Done
- **11/23 meeting:** events removed everywhere; news limited to public companies (plus curated items in `news-pinned.json`); "Join as an investor" → mailing list; "pitch night" removed from hosting copy; "Screen deals" added (open to anyone); team listed first in "What we look for"; capital-light "preferred"; "Princeton connection is NOT required" / "You DON'T need a Princeton connection"; one "Alumni (undergraduate & graduate)" pill; SOSV (IndieBio, HAX) added and Nassau Street Ventures removed; Angel Capital Association replaces NY Area Angel Alliance; Online/AngelList removed; homepage hero is Henry Hall from Princeton's Campus Beauty library (credited as its terms require).
- **Earlier:** stats, funnel, stage, check size, SPV removal, accredited-investor ⓘ, copy edits, Portfolio page, event photos and gallery, Gust link on all "Apply for consideration" buttons, emails kept as investors@ / startups@princetonangels.org, larger logo.

## Parked
- Rob's US/global map of portfolio companies ("one thing at a time").
