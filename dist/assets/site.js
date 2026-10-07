/* Princeton Alumni Angels site script.
   Every list on the site (events, portfolio news, LinkedIn posts, portfolio companies, headline stats)
   is read from /data/*.json, or from a published Google Sheet CSV when one is set in data/site.json.
   Nobody needs to edit HTML to keep the site current. See README.md. */
(function () {
  "use strict";
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CONFIG = {};
  var TZ = "America/New_York";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) { return /^(https?:|mailto:|[a-z0-9._\/#-]+$)/i.test(u || "") ? u : "#"; }

  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " returned " + r.status);
      return r.json();
    });
  }

  // Minimal CSV parser for a Google Sheet published as CSV (File > Share > Publish to web > CSV).
  function parseCSV(text) {
    var rows = [], row = [], cell = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    var head = (rows.shift() || []).map(function (h) { return h.trim(); });
    return rows.filter(function (r) { return r.some(function (x) { return x.trim(); }); }).map(function (r) {
      var o = {};
      head.forEach(function (h, i) {
        var v = (r[i] || "").trim();
        if (h === "audience") v = v ? v.split(/[|;,]\s*/) : [];
        if (h === "sample") v = /^(true|yes|1)$/i.test(v);
        o[h] = v;
      });
      return o;
    });
  }

  function load(name) {
    var src = (CONFIG.sources || {})[name] || {};
    var fromJson = function () {
      return getJSON(src.json || ("data/" + name + ".json")).then(function (d) { return Array.isArray(d) ? d : (d.items || []); });
    };
    if (src.csv) {
      return fetch(src.csv).then(function (r) {
        if (!r.ok) throw new Error("csv");
        return r.text();
      }).then(parseCSV).catch(fromJson);
    }
    return fromJson();
  }

  // ---------- dates ----------
  function parseDate(s) {
    if (!s) return null;
    // A bare date (2025-09-08) means that calendar day in Eastern time, not midnight UTC.
    var d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? s + "T12:00:00-04:00" : s);
    return isNaN(d) ? null : d;
  }
  function fmt(d, opts) { return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: TZ }, opts)).format(d); }
  function fmtDate(s) { var d = parseDate(s); return d ? fmt(d, { month: "short", day: "numeric", year: "numeric" }) : ""; }
  function hasTime(s) { return /T\d{2}:\d{2}/.test(s || ""); }

  // ---------- renderers ----------
  function emptyState(el, text) { el.innerHTML = '<li class="feed-empty">' + text + "</li>"; }
  var exampleTag = ' <span class="tag" title="Placeholder content. Replace in the events sheet or data file.">Example</span>';

  function renderEvents(el, items) {
    var show = el.dataset.show || "upcoming";
    var aud = el.dataset.audience;
    var limit = +el.dataset.limit || 99;
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var list = items.filter(function (e) {
      var d = parseDate(e.date); if (!d) return false;
      if (aud && e.audience && e.audience.length && e.audience.indexOf(aud) < 0) return false;
      var end = parseDate(e.end) || d;
      return show === "past" ? end < now : show === "all" ? true : end >= now;
    }).sort(function (a, b) {
      return show === "past" ? parseDate(b.date) - parseDate(a.date) : parseDate(a.date) - parseDate(b.date);
    }).slice(0, limit);

    if (!list.length) {
      return emptyState(el, show === "past" ? "Past events will appear here." :
        'No events on the calendar right now. <a href="#newsletter">Get the newsletter</a> to hear about the next one first.');
    }
    el.innerHTML = list.map(function (e) {
      var d = parseDate(e.date);
      var when = hasTime(e.date) ? fmt(d, { weekday: "short", hour: "numeric", minute: "2-digit" }) + " ET" : fmt(d, { weekday: "long" });
      var title = e.url ? '<a href="' + esc(safeUrl(e.url)) + '">' + esc(e.title) + "</a>" : esc(e.title);
      return '<li class="event">' +
        '<div class="event-date" aria-hidden="true"><span class="m">' + fmt(d, { month: "short" }).toUpperCase() + '</span><span class="d">' + fmt(d, { day: "numeric" }) + "</span></div>" +
        '<div class="event-body"><p class="meta">' + esc(fmt(d, { month: "short", day: "numeric" })) + " · " + esc(when) + (e.location ? " · " + esc(e.location) : "") + "</p>" +
        "<h4>" + title + (e.sample ? exampleTag : "") + "</h4>" +
        (e.description ? '<p class="small">' + esc(e.description) + "</p>" : "") +
        "</div></li>";
    }).join("");
  }

  function renderNews(el, items) {
    var limit = +el.dataset.limit || 99;
    var list = items.filter(function (n) { return parseDate(n.date); })
      .sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); }).slice(0, limit);
    if (!list.length) return emptyState(el, "Portfolio news will appear here as it is published.");
    el.innerHTML = list.map(function (n) {
      return '<li class="news-item"><p class="meta"><span class="co">' + esc(n.company) + "</span> · " + esc(fmtDate(n.date)) + "</p>" +
        '<h4><a href="' + esc(safeUrl(n.url)) + '">' + esc(n.headline) + "</a></h4>" +
        (n.source ? '<p class="meta">' + esc(n.source) + "</p>" : "") + "</li>";
    }).join("");
  }

  function renderLinkedIn(el, items) {
    var limit = +el.dataset.limit || 99;
    var embed = (CONFIG.linkedin || {}).mode === "embed";
    var list = items.slice(0, limit);
    if (!list.length) return emptyState(el, "Follow PAA on LinkedIn for announcements.");
    el.innerHTML = list.map(function (p) {
      if (embed && p.urn) {
        return '<li class="li-post"><iframe title="LinkedIn post" loading="lazy" src="https://www.linkedin.com/embed/feed/update/' + esc(p.urn) + '"></iframe></li>';
      }
      return '<li class="li-post">' + (p.date ? '<p class="meta">' + esc(fmtDate(p.date)) + "</p>" : "") +
        "<p>" + esc(p.text) + "</p>" +
        '<a class="more" href="' + esc(safeUrl(p.url)) + '">Read on LinkedIn</a></li>';
    }).join("");
  }

  function renderPortfolio(el, items) {
    var filters = document.querySelector("[data-portfolio-filters]");
    var sectors = [];
    items.forEach(function (c) { if (c.sector && sectors.indexOf(c.sector) < 0) sectors.push(c.sector); });
    sectors.sort();
    var draw = function (sector) {
      var list = items.filter(function (c) { return !sector || c.sector === sector; })
        .sort(function (a, b) { return a.name.localeCompare(b.name); });
      el.innerHTML = list.map(function (c) {
        return '<li class="company">' +
          (c.sector || c.year ? '<p class="meta">' + esc([c.sector, c.year ? "Since " + c.year : ""].filter(Boolean).join(" · ")) + "</p>" : "") +
          "<h4>" + esc(c.name) + "</h4>" +
          (c.blurb ? "<p>" + esc(c.blurb) + "</p>" : "") +
          (c.website ? '<a class="more" href="' + esc(safeUrl(c.website)) + '">Website</a>' : "") + "</li>";
      }).join("");
    };
    if (filters && sectors.length > 1) {
      filters.innerHTML = ["All"].concat(sectors).map(function (s, i) {
        return '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-sector="' + esc(i ? s : "") + '">' + esc(s) + "</button>";
      }).join("");
      filters.addEventListener("click", function (ev) {
        var b = ev.target.closest(".chip"); if (!b) return;
        $$(".chip", filters).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        draw(b.dataset.sector);
      });
    }
    draw("");
  }

  var RENDER = { events: renderEvents, news: renderNews, linkedin: renderLinkedIn, portfolio: renderPortfolio };

  function hydrateFeeds() {
    var cache = {};
    $$("[data-feed]").forEach(function (el) {
      var name = el.dataset.feed;
      cache[name] = cache[name] || load(name);
      cache[name].then(function (items) { RENDER[name](el, items); })
        .catch(function () { emptyState(el, "This list couldn't load. Refresh the page to try again."); });
    });
  }

  function applyConfig() {
    var stats = CONFIG.stats || {};
    $$("[data-stat]").forEach(function (el) { if (stats[el.dataset.stat]) el.textContent = stats[el.dataset.stat]; });
    var links = CONFIG.links || {};
    $$("[data-link]").forEach(function (el) { if (links[el.dataset.link]) el.href = links[el.dataset.link]; });
    var emails = CONFIG.emails || {};
    $$("[data-email]").forEach(function (el) {
      var v = emails[el.dataset.email]; if (!v) return;
      if (el.tagName === "A") el.href = "mailto:" + v;
      el.textContent = v;
    });
  }

  // ---------- mailing list ----------
  function wireSignup() {
    $$("form[data-signup]").forEach(function (form) {
      var note = form.querySelector("[data-form-note]");
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var email = form.querySelector("input[type=email]");
        note.classList.remove("error");
        if (!email.value || !email.checkValidity()) {
          note.classList.add("error");
          note.textContent = "Enter an email address like name@example.com.";
          email.focus();
          return;
        }
        var endpoint = (CONFIG.mailingList || {}).endpoint;
        if (!endpoint) {
          note.textContent = "Preview only: this form isn't connected to a mailing list yet, so nothing was sent.";
          return;
        }
        var btn = form.querySelector("button"); btn.disabled = true; btn.textContent = "Subscribing…";
        fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error();
            form.reset();
            note.textContent = "You're on the list. Watch your inbox for the next PAA update.";
          })
          .catch(function () {
            note.classList.add("error");
            note.textContent = "That didn't go through. Try again in a minute, or email " + ((CONFIG.emails || {}).investors || "us") + ".";
          })
          .then(function () { btn.disabled = false; btn.textContent = "Subscribe"; });
      });
    });
  }

  function wireNav() {
    var btn = document.getElementById("nav-toggle"), nav = document.getElementById("site-nav");
    if (btn && nav) {
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", open);
      });
      nav.addEventListener("click", function (e) { if (e.target.closest("a")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
    }
    var page = document.body.dataset.page;
    $$("[data-nav]").forEach(function (a) { if (a.dataset.nav === page) a.setAttribute("aria-current", "page"); });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  function start() {
    wireNav();
    wireSignup();
    getJSON("data/site.json").then(function (c) { CONFIG = c || {}; }).catch(function () {})
      .then(function () { applyConfig(); hydrateFeeds(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
