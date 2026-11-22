# Pending website edits

Edits waiting on information from Gia, Rob or the PAA team. Each item says what's needed and what changes once it arrives.
Last updated: Nov 22, 2026.

## Waiting on info

| # | Edit | What we need | From | What happens once we have it |
|---|---|---|---|---|
| 1 | **Connect the mailing list** | Which tool sends PAA's email invitations today (Mailchimp, Constant Contact, etc.) and its signup-form link. If PAA has no list tool: a Formspree form link (free; signups arrive as emails). | Rob | Paste the link into `mailingList.endpoint` in `dist/data/site.json`. Signups on every page start working (today they show "Preview only"). |
| 2 | **Connect the events calendar** | The PAA Google Calendar's **Public address in iCal format** (Calendar → Settings and sharing → Make available to public → Integrate calendar). | Gia / Rob | Paste into `sources.events.ics` in `site.json`. Events then update every night on their own. Add `#founders`, `#investors` or `#community` to an event's description to show it on that page. |
| 3 | **RSVP link for the Dec 14 Winter Gathering** | The public Eventbrite (or other) RSVP link. The one in the email is a personal tracking link. | Rob | Add it as the event's `url` in `dist/data/events.json` (or it comes in automatically once the calendar is connected). |
| 4 | **Confirm the Gust link** | Check that `gust.com/organizations/princeton-alumni-angels/member_landing` is the founder application, not the member sign-in. | Diane / Rob | If it's the wrong page, swap the link in `links.founderApply`. All five "Apply for consideration" buttons update. |
| 5 | **LinkedIn embed** | LinkedIn page admin access (or post links/embed codes). | Gia | Switch `linkedin.mode` to `"embed"` and add posts to `dist/data/linkedin.json`. |
| 6 | **Portfolio sectors** | Team review of the draft sector buckets. 16 companies have no sector yet: Susterre Technologies, Round21, Landsdowne Labs, BACCH Labs, Bluewave Technologies, PureLi, Integrated Reality Labs, Soliome, Limax, Measure Studio, Auggie, CarbonBridge, Duet, Flourish Care, Green Energy, Mothership Materials (and check Kubik under Climate & cleantech). | Gia / Rob | Update `sector` in `dist/data/portfolio.json`; filters update automatically. |
| 7 | **Portfolio websites and logos** | Confirm each company's website (or a master list with websites). | Rob | Add `website` and a logo file per company; logos link to their sites. |
| 8 | **Portfolio count** | The Angel 101 deck says 62 investments but lists 61 names. Which company was funded twice, or is one missing? | Rob | Add the missing company if there is one. |
| 9 | **Final stats** | Confirm 33%+ women-led, 35+ pitch events and 60+ companies (flyers say 38% / 40+). | Gia / Rob | Change once in `stats` in `site.json`; every page updates. |

## Done (for reference)
- Stats, funnel, stage, check size, SPV removal, accredited-investor ⓘ, copy edits, Portfolio page (from feedback call).
- Event photos from Gia; Firestone Library on the homepage (credited); "Where we gather" gallery.
- Gust link on all "Apply for consideration" buttons; applications open year-round.
- Emails kept as investors@ / startups@princetonangels.org; NY Area Angel Alliance kept; logo slightly larger.

## Parked
- Rob's US/global map of portfolio companies ("one thing at a time").
