"""Nightly refresh for the PAA website. Runs in GitHub Actions (see .github/workflows/refresh-feeds.yml).

1. Portfolio news: searches Google News for every company in data/portfolio.json,
   keeps the last 12 months of headlines, merges data/news-pinned.json, writes data/news.json.
2. Events: if data/site.json has sources.events.ics (a public Google Calendar or Luma .ics link),
   rebuilds data/events.json from that calendar. Otherwise events.json is left alone.

Standard library only, so there is nothing to install.
"""
import json, re, datetime as dt, email.utils, urllib.parse, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "dist" / "data"
UA = {"User-Agent": "PAA-website-refresh/1.0"}
NEWS_WINDOW_DAYS = 365
MAX_PER_COMPANY = 3
MAX_TOTAL = 40


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def load(name):
    return json.loads((DATA / name).read_text())


def save(name, obj):
    (DATA / name).write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n")


# ---------------- portfolio news ----------------
def company_news(company):
    q = company.get("newsQuery") or f'"{company["name"]}"'
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q, "hl": "en-US", "gl": "US", "ceid": "US:en"})
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=NEWS_WINDOW_DAYS)
    out = []
    for item in ET.fromstring(fetch(url)).iter("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        source = (item.findtext("source") or "").strip()
        try:
            when = email.utils.parsedate_to_datetime(item.findtext("pubDate"))
        except Exception:
            continue
        if when < cutoff or not title:
            continue
        if source and title.endswith(" - " + source):
            title = title[: -len(source) - 3]
        # Skip results that don't actually name the company (common with short names).
        if company["name"].lower() not in title.lower():
            continue
        out.append({"company": company["name"], "headline": title, "date": when.date().isoformat(), "source": source, "url": link})
    out.sort(key=lambda n: n["date"], reverse=True)
    return out[:MAX_PER_COMPANY]


def refresh_news():
    items = []
    for c in load("portfolio.json")["items"]:
        try:
            items += company_news(c)
        except Exception as e:  # one bad feed shouldn't stop the rest
            print(f"news: skipped {c['name']}: {e}")
    try:
        items += load("news-pinned.json")["items"]
    except FileNotFoundError:
        pass
    seen, unique = set(), []
    for n in sorted(items, key=lambda n: n["date"], reverse=True):
        key = re.sub(r"\W+", "", n["headline"].lower())[:80]
        if key not in seen:
            seen.add(key)
            unique.append(n)
    old = load("news.json")
    save("news.json", {"_help": old.get("_help", ""), "updated": dt.date.today().isoformat(), "items": unique[:MAX_TOTAL]})
    print(f"news: {len(unique[:MAX_TOTAL])} items")


# ---------------- events from a calendar ----------------
def ics_events(text):
    text = re.sub(r"\r?\n[ \t]", "", text)  # unfold wrapped lines
    events, cur = [], None
    for line in text.splitlines():
        if line == "BEGIN:VEVENT":
            cur = {}
        elif line == "END:VEVENT" and cur is not None:
            events.append(cur)
            cur = None
        elif cur is not None and ":" in line:
            key, val = line.split(":", 1)
            name, *params = key.split(";")
            cur[name] = (val, params)
    return events


def ics_date(val, params):
    tz = next((p.split("=", 1)[1] for p in params if p.startswith("TZID=")), None)
    if re.fullmatch(r"\d{8}", val):
        return dt.datetime.strptime(val, "%Y%m%d").date().isoformat()
    utc = val.endswith("Z")
    d = dt.datetime.strptime(val.rstrip("Z"), "%Y%m%dT%H%M%S")
    if utc:
        d = d.replace(tzinfo=dt.timezone.utc)
    else:
        from zoneinfo import ZoneInfo
        d = d.replace(tzinfo=ZoneInfo(tz or "America/New_York"))
    return d.isoformat()


def unescape(s):
    return s.replace("\\n", " ").replace("\\,", ",").replace("\\;", ";").replace("\\\\", "\\").strip()


def refresh_events():
    ics_url = load("site.json").get("sources", {}).get("events", {}).get("ics", "")
    if not ics_url:
        print("events: no calendar link set, leaving events.json as is")
        return
    items = []
    for e in ics_events(fetch(ics_url)):
        if "DTSTART" not in e:
            continue
        desc = unescape(e.get("DESCRIPTION", ("", []))[0])
        # Tag audiences by writing e.g. "#founders #investors" anywhere in the calendar description.
        audience = sorted(set(re.findall(r"#(founders|investors|community)", desc)))
        desc = re.sub(r"#(founders|investors|community)", "", desc).strip()
        url = e.get("URL", ("", []))[0] or next(iter(re.findall(r"https?://\S+", desc)), "")
        items.append({
            "title": unescape(e.get("SUMMARY", ("Untitled", []))[0]),
            "date": ics_date(*e["DTSTART"]),
            "end": ics_date(*e["DTEND"]) if "DTEND" in e else "",
            "location": unescape(e.get("LOCATION", ("", []))[0]),
            "audience": audience,
            "description": desc[:280],
            "url": url,
        })
    items.sort(key=lambda x: x["date"])
    old = load("events.json")
    save("events.json", {"_help": old.get("_help", ""), "items": items})
    print(f"events: {len(items)} items")


if __name__ == "__main__":
    refresh_news()
    refresh_events()
