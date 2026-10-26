/* v4 · renders every section from window.EVIDENCE. No number is typed into the HTML. */
(function () {
  "use strict";
  var E = window.EVIDENCE, root = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var unit = function (id) { return E.units.find(function (u) { return u.id === id; }); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var CONF = { R: "résumé", R1: "résumé", S: "site", P: "public" };
  var chip = function (c) { return CONF[c] ? '<span class="conf ' + c + '" title="Source: ' + CONF[c] + '">' + CONF[c] + "</span>" : ""; };
  var draft = '<span class="conf draft" title="Placeholder wording, to be confirmed">draft</span>';
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var short = function (o) { return o.replace(/^Independent · /, "").replace(/^Mavenir · /, ""); };

  /* ---------- hero readout, driven by the simulation ---------- */
  function hero() {
    var stateEl = $("#live-state"), lim = $("#live-limit"), from = $("#live-from"), num = $("#live-num"), live = $(".live");
    var decide = $("#decide"), another = $("#another");
    function show(st) {
      var sc = st.scenario; if (!sc) return;
      lim.textContent = sc.label;
      from.textContent = "· " + short(sc.org);
      live.classList.toggle("cleared", st.cleared);
      if (st.cleared) {
        stateEl.innerHTML = "<span>The call: </span>" + esc(sc.call);
        num.innerHTML = esc(sc.what[0].toUpperCase() + sc.what.slice(1)) + ": " + (sc.before ? esc(sc.before) + " → " : "") + "<em>" + esc(sc.after) + "</em> " + chip(sc.conf);
        num.hidden = sc.id === "yvr"; decide.disabled = true; decide.textContent = "Call made ✓";
      } else {
        stateEl.textContent = "Work piles up at one stuck point. Other paths sit idle.";
        num.hidden = true; decide.disabled = false; decide.textContent = "Make the call";
      }
    }
    var eg = document.getElementById("eg"), y = unit("yvr");
    if (eg && y && y.sim) eg.innerHTML = "At Vancouver Airport: " + esc(y.sim.what) + " " + esc(y.sim.before) + " → <b>" + esc(y.sim.after) + "</b>, with no new budget. " + chip(y.sim.conf);
    window.__egScen = y && y.sim;
    var since = document.getElementById("since"); if (since && E.since) since.textContent = (new Date().getFullYear() - E.since) + " years building platforms";
    var wait = setInterval(function () {
      if (!window.SIM) return; clearInterval(wait);
      window.SIM.onState(show);
      decide.addEventListener("click", function () { window.SIM.clear(); });
      another.addEventListener("click", function () { window.SIM.next(); });
    }, 50);
  }

  /* ---------- meters: build, then play once in view (3b1b-style: one change at a time, captioned) ---------- */
  function meterSvg(m) {
    var W = 280, s = "";
    if (m.kind === "before-after") {
      var sx = function (v) { return (v / m.max) * 190; };
      s += '<text class="m-t" x="0" y="15">' + m.rows[0].label + '</text><rect class="m-track" x="56" y="3" width="190" height="16" rx="3"/><rect class="m-before m-grow" x="56" y="3" width="' + sx(m.rows[0].v) + '" height="16" rx="3"/><text class="m-v" x="' + (62 + sx(m.rows[0].v)) + '" y="16">' + m.rows[0].v + m.unit + "</text>";
      s += '<g class="m-step" style="transition-delay:1s"><text class="m-t" x="0" y="45" style="fill:var(--ink)">' + m.rows[1].label + '</text><rect class="m-track" x="56" y="33" width="190" height="16" rx="3"/><rect class="m-after" x="56" y="33" width="' + sx(m.rows[1].v) + '" height="16" rx="3"/><rect class="m-box" x="56" y="33" width="' + sx(m.rows[1].v) + '" height="16" rx="3"/><text class="m-v" x="' + (62 + sx(m.rows[1].v)) + '" y="46">' + m.rows[1].v + m.unit + "</text></g>";
      return '<svg viewBox="0 0 ' + W + ' 54" role="img" aria-label="' + esc(m.what + ": " + m.rows[0].v + m.unit + " before, " + m.rows[1].v + m.unit + " after") + '">' + s + "</svg>";
    }
    if (m.kind === "pairs") {
      m.rows.forEach(function (r, i) {
        var y = i * 40, sx = function (v) { return (v / r.max) * 150; };
        s += '<text class="m-t" x="0" y="' + (y + 15) + '">' + r.label + '</text><rect class="m-track" x="100" y="' + (y + 3) + '" width="150" height="16" rx="3"/>';
        s += '<rect class="m-before m-grow" x="100" y="' + (y + 3) + '" width="' + sx(r.from) + '" height="16" rx="3"/>';
        s += '<g class="m-step" style="transition-delay:' + (1 + i * 0.9) + 's"><rect class="m-after" x="100" y="' + (y + 3) + '" width="' + sx(r.to) + '" height="16" rx="3"/><rect class="m-box" x="100" y="' + (y + 3) + '" width="' + sx(r.to) + '" height="16" rx="3"/></g>';
        s += '<text class="m-v" x="100" y="' + (y + 35) + '">' + r.from + r.unit + ' <tspan class="m-step" style="transition-delay:' + (1 + i * 0.9) + 's">→ ' + r.to + r.unit + "</tspan></text>";
      });
      return '<svg viewBox="0 0 ' + W + ' 78" role="img" aria-label="' + esc(m.rows.map(function (r) { return r.label + " " + r.from + r.unit + " to " + r.to + r.unit; }).join("; ")) + '">' + s + "</svg>";
    }
    if (m.kind === "compare") {
      var H = 56, base = 66;
      m.rows.forEach(function (r, i) {
        var x = 60 + i * 110, h = (r.v / m.max) * H;
        if (r.v > 0) s += '<g class="m-step" style="transition-delay:' + (i * 1) + 's"><rect class="m-after m-rise" x="' + x + '" y="' + (base - h) + '" width="56" height="' + h + '" rx="3"/><rect class="m-box" x="' + x + '" y="' + (base - h) + '" width="56" height="' + h + '" rx="3"/></g>';
        else s += '<line class="m-zero m-step" style="transition-delay:' + (i * 1) + 's" x1="' + x + '" x2="' + (x + 56) + '" y1="' + (base - 1) + '" y2="' + (base - 1) + '"/>';
        s += '<text class="m-v m-step" style="transition-delay:' + (i * 1) + 's" x="' + (x + 28) + '" y="' + (base - h - 6) + '" text-anchor="middle">' + (r.v % 1 ? r.v.toFixed(1) : r.v) + m.unit + '</text><text class="m-t" x="' + (x + 28) + '" y="' + (base + 15) + '" text-anchor="middle">' + r.label + "</text>";
      });
      s = '<line x1="40" x2="250" y1="' + base + '" y2="' + base + '" stroke="var(--rule2)"/>' + s;
      return '<svg viewBox="0 0 ' + W + ' 86" role="img" aria-label="' + esc(m.rows.map(function (r) { return r.label + " " + r.v + m.unit + " " + m.what; }).join("; ")) + '">' + s + "</svg>";
    }
    if (m.kind === "gain") { // baseline = 100; the gain is drawn on the same scale; the side condition stays in words
      var gx = function (v) { return (v / (100 + m.max)) * 190; };
      s += '<text class="m-t" x="0" y="15">before</text><rect class="m-track" x="56" y="3" width="190" height="16" rx="3"/><rect class="m-before m-grow" x="56" y="3" width="' + gx(100) + '" height="16" rx="3"/><text class="m-v" x="' + (62 + gx(100)) + '" y="16">base</text>';
      s += '<g class="m-step" style="transition-delay:.8s"><text class="m-t" x="0" y="45" style="fill:var(--ink)">after</text><rect class="m-track" x="56" y="33" width="190" height="16" rx="3"/><rect class="m-after" x="56" y="33" width="' + gx(100 + m.v) + '" height="16" rx="3"/><rect class="m-box" x="56" y="33" width="' + gx(100 + m.v) + '" height="16" rx="3"/><text class="m-v" x="' + (62 + gx(100 + m.v)) + '" y="46">+' + m.v + m.unit + "</text></g>";
      return '<svg viewBox="0 0 ' + W + ' 54" role="img" aria-label="' + esc(m.what + ": +" + m.v + m.unit + " over the base") + '">' + s + "</svg>";
    }
    if (m.kind === "slopes") { // two small before → after panels; the arrow says which way is good
      m.rows.forEach(function (r, i) {
        var x = i * 145, top = 36, h = 40, hi = Math.max(r.from, r.to) * 1.1, Y = function (v) { return top + h - (v / hi) * h; };
        s += '<text class="m-t" x="' + (x + 4) + '" y="12" style="fill:var(--ink);font-weight:600">' + esc(r.label) + '</text><text class="m-t" x="' + (x + 4) + '" y="26" style="font-size:11px">' + (r.good === "up" ? "higher is better" : "lower is better") + "</text>";
        s += '<line x1="' + (x + 8) + '" x2="' + (x + 128) + '" y1="' + (top + h) + '" y2="' + (top + h) + '" stroke="var(--rule2)"/>';
        s += '<circle cx="' + (x + 30) + '" cy="' + Y(r.from) + '" r="4" class="m-before" style="opacity:.8"/><text class="m-v" x="' + (x + 22) + '" y="' + (Y(r.from) + 4) + '" text-anchor="end">' + r.from + r.unit + "</text>";
        s += '<g class="m-step" style="transition-delay:' + (0.6 + i * 0.9) + 's"><line x1="' + (x + 30) + '" y1="' + Y(r.from) + '" x2="' + (x + 94) + '" y2="' + Y(r.to) + '" stroke="var(--sig)" stroke-width="2"/><rect x="' + (x + 88) + '" y="' + (Y(r.to) - 6) + '" width="12" height="12" rx="2" style="fill:var(--panel)"/><rect class="m-box" x="' + (x + 88) + '" y="' + (Y(r.to) - 6) + '" width="12" height="12" rx="2"/>' +
          '<text class="m-v" x="' + (x + 106) + '" y="' + (Y(r.to) + 4) + '">' + r.to + r.unit + "</text></g>";
        s += '<text class="m-t" x="' + (x + 30) + '" y="' + (top + h + 15) + '" text-anchor="middle" style="font-size:10.5px">before</text><text class="m-t" x="' + (x + 94) + '" y="' + (top + h + 15) + '" text-anchor="middle" style="font-size:10.5px">after</text>';
      });
      return '<svg viewBox="0 0 ' + W + ' 94" role="img" aria-label="' + esc(m.rows.map(function (r) { return r.label + " from " + r.from + r.unit + " to " + r.to + r.unit; }).join("; ")) + '">' + s + "</svg>";
    }
    if (m.kind === "absolute") { // true scale from zero, so a small gain looks small
      var sx2 = function (v) { return (v / 15) * 170; };
      s += '<text class="m-t" x="0" y="15">without</text><rect class="m-track" x="76" y="3" width="170" height="16" rx="3"/><rect class="m-before m-grow" x="76" y="3" width="' + sx2(m.without) + '" height="16" rx="3"/><text class="m-v" x="' + (82 + sx2(m.without)) + '" y="16">' + m.without + m.unit + "</text>";
      s += '<g class="m-step" style="transition-delay:1s"><text class="m-t" x="0" y="45" style="fill:var(--ink)">with forecast</text><rect class="m-track" x="76" y="33" width="170" height="16" rx="3"/><rect class="m-after" x="76" y="33" width="' + sx2(m.with) + '" height="16" rx="3"/><rect class="m-box" x="76" y="33" width="' + sx2(m.with) + '" height="16" rx="3"/><text class="m-v" x="' + (82 + sx2(m.with)) + '" y="46">' + m.with + m.unit + "</text></g>";
      return '<svg viewBox="0 0 ' + W + ' 54" role="img" aria-label="' + esc(m.what + ": " + m.without + m.unit + " without the forecast, " + m.with + m.unit + " with it") + '">' + s + "</svg>";
    }
    return "";
  }
  function meterCaption(m) {
    var a = function (t, d) { return '<span class="m-step" style="transition-delay:' + d + 's">' + t + "</span> "; };
    if (m.kind === "before-after") {
      var cut = Math.round((1 - m.rows[1].v / m.rows[0].v) * 100);
      return a("Share " + esc(m.what) + ".", 0) + a(cut === 50 ? "<b>Cut in half.</b>" : "<b>" + cut + "% less.</b>", 1.8);
    }
    if (m.kind === "slopes") return a("<b>More time on stability, and releases got faster.</b>", 2.2);
    if (m.kind === "absolute") { var rel = ((m.without - m.with) / m.without * 100).toFixed(1); return a("Error rate, lower is better.", 0) + a("<b>" + rel + "% fewer errors: small, real, drawn to scale.</b> " + esc(m.other) + ". Simulated: " + esc(m.note) + ".", 1.4); }
    if (m.kind === "gain") return a(esc(m.what) + ".", 0.4) + a("<b>" + esc(m.side) + "</b>", 1.4);
    return "";
  }
  function featured() {
    var list = E.units.filter(function (u) { return u.featured; }).sort(function (a, b) { return a.featured - b.featured; });
    $("#featured").innerHTML = list.map(function (u) {
      var m = u.meter;
      return '<article class="case" id="case-' + u.id + '">' +
        '<p class="org">' + esc(u.org) + "</p>" +
        "<h3>" + esc(u.headline) + "</h3>" +
        '<figure class="meter" style="margin:0">' + meterSvg(m) + '<figcaption class="cap">' + meterCaption(m) + " " + chip(m.conf) + "</figcaption>" +
        (reduce.matches ? "" : '<button type="button" class="replay" aria-label="Replay the chart">↻ replay</button>') + "</figure>" +
        '<span class="tag" title="' + esc(u.constraint) + '">Limit: ' + esc(u.plainLimit || u.constraint) + "</span>" +
        '<dl class="two"><div><dt>business</dt><dd>' + esc(u.biz) + "</dd></div><div><dt>under the hood</dt><dd>" + esc(u.built) + "</dd></div></dl>" +
        (u.miss ? '<p class="miss">' + (u.miss.draft ? "" : "") + "What I got wrong: " + esc(u.miss.text) + (u.miss.draft ? " " + draft : "") + "</p>" : "") +
        '<p class="rule">' + esc(u.learning) + "</p>" +
        '<p class="so"><b>In short</b><span>' + esc(u.check) + "</span></p></article>";
    }).join("");
    var meters = document.querySelectorAll(".meter");
    if (reduce.matches || !("IntersectionObserver" in window)) { meters.forEach(function (m) { m.classList.add("on"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }); }, { threshold: 0.6 });
    meters.forEach(function (m) { io.observe(m); });
    document.addEventListener("click", function (ev) {
      var b = ev.target.closest(".replay"); if (!b) return;
      var m = b.closest(".meter"); m.classList.remove("on"); void m.offsetWidth; requestAnimationFrame(function () { m.classList.add("on"); });
    });
  }

  /* ---------- all cases ---------- */
  function rows() {
    $("#all-count").textContent = E.units.length;
    $("#rows").innerHTML = E.units.map(function (u) {
      var m = (u.metrics || [])[0];
      var line = function (k, v) { return v ? "<p><b>" + k + "</b>" + esc(v) + "</p>" : ""; };
      return '<li><details><summary><span class="t">' + esc(u.title) + '</span><span class="o">' + esc(u.org) + " · " + u.years[0] + (u.years[1] !== u.years[0] ? "–" + u.years[1] : "") + "</span>" +
        '<span class="n">' + (m ? esc(m.v) : "") + "</span></summary>" +
        '<div class="body">' + line("problem", u.problem) + line("decision", u.decision) + line("built", u.system) + line("people", u.human) + line("result", u.outcome) + line("rule", u.learning) +
        (u.metrics && u.metrics.length ? '<p class="mets">' + u.metrics.map(function (x) { return "<span><strong>" + esc(x.v) + "</strong> " + esc(x.label) + " " + chip(x.conf) + "</span>"; }).join("") + "</p>" : "") +
        '<p class="proof">' + (u.proof || []).map(function (p) { return '<a href="' + esc(p.href) + '">' + esc(p.label) + " ↗</a>"; }).join("") + "</p></div></details></li>";
    }).join("");
  }

  /* ---------- hard calls as balances ---------- */
  function calls() {
    $("#balances").innerHTML = E.hardCalls.map(function (c) {
      var u = unit(c.unit);
      return '<div class="bal"><p class="who">' + esc(short(u.org)) + '</p><div class="side ten"><small>tension</small>' + esc(c.tension) + '</div><div class="side call"><small>the call</small>' + esc(c.call) + '</div><div class="beam" aria-hidden="true"></div><p class="cost"><b>cost</b>' + esc(c.cost) + "</p></div>";
    }).join("");
  }

  /* ---------- the loop, rules, plan ---------- */
  function how() {
    $("#loop").innerHTML = E.stages.map(function (s, i) {
      var u = unit((E.loopExamples || {})[s.id]);
      return '<li><span class="no">' + (i + 1) + '</span><span class="nm">' + esc(s.label) + '</span><span class="ln">' + esc(s.line) + "</span>" +
        (u ? '<a class="ex" href="#all" data-open="' + u.id + '">e.g. ' + esc(short(u.org)) + "</a>" : "") + "</li>";
    }).join("");
    if (E.weekOne && $("#weekone")) $("#weekone").innerHTML = "<p>" + esc(E.weekOne.intro) + "</p><ol>" + E.weekOne.asks.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + "</ol>";
    $("#plan").innerHTML = E.plan90.steps.map(function (p) { return "<li><b>" + esc(p.when) + "</b>" + esc(p.what) + "</li>"; }).join("");
  }
  function openCase(id) {
    $("#all").open = true;
    var idx = E.units.findIndex(function (u) { return u.id === id; }), d = document.querySelectorAll("#rows details")[idx];
    if (d) { d.open = true; d.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "center" }); d.querySelector("summary").focus({ preventScroll: true }); }
  }
  document.addEventListener("click", function (ev) { var a = ev.target.closest("[data-open]"); if (!a) return; ev.preventDefault(); openCase(a.dataset.open); });

  /* ---------- anatomy figures, tiles, contact ---------- */
  function proof() {
    var lab = unit("ailab");
    var FIG = [
      { href: "lab/uet-spray/", light: "lab/uet-spray/light.html", img: "lab/uet-spray", t: "One message, four paths", p: "AI training jams when every packet takes one road. Spraying them across all roads keeps the GPUs busy.", alt: "A machine showing one message sprayed across four network spines" },
      { href: "lab/gpudirect-rdma/", light: "lab/gpudirect-rdma/light.html", img: "lab/gpudirect-rdma", t: "GPU to GPU, no detour", p: "Data can skip the computer\u2019s main memory on its way between two GPUs. Fewer stops, less waiting.", alt: "A machine showing a tensor moving from GPU to GPU across a rack" },
    ];
    $("#figs").innerHTML = FIG.map(function (f) {
      return '<a class="fig" href="' + f.href + '" data-dark="' + f.href + '" data-light="' + f.light + '"><img class="th-l" src="' + f.img + '/thumb-light.png" alt="' + esc(f.alt) + '" loading="lazy"><img class="th-d" src="' + f.img + '/thumb.png" alt="' + esc(f.alt) + '" loading="lazy"><div><small>learning · not yet built in a job</small><b>' + esc(f.t) + "</b><p>" + esc(f.p) + "</p></div></a>";
    }).join("");
    var T = [["weatherran", "TelcoEdge"], ["anomedge", "AEdge"], ["camara", "camara-dev"], ["realengine", "realEngine"]];
    $("#tiles").innerHTML = T.map(function (t) {
      var u = unit(t[0]), m = u.metrics[0], p = u.proof[0];
      return '<a class="tile" href="' + esc(p.href) + '"><b>' + t[1] + " ↗</b><span>" + esc(u.title) + '</span><span class="v">' + esc(m.v) + ' <small style="font:400 12px var(--sans);color:var(--muted)">' + esc(m.label) + "</small> " + chip(m.conf) + "</span></a>";
    }).join("") + '<a class="tile" href="Ashutosh_Shukla_Resume.pdf"><b>Résumé ↗</b><span>Roles, dates and numbers in one PDF.</span></a>';
    $("#creds").textContent = "Credentials: " + E.credentials.join(" · ") + ".";
    if (lab) { /* lab unit feeds the figure strip; its brief stays held back until corrected */ }
    var p = E.person;
    if (p.email) { var em = $("#email"); em.textContent = p.email; em.hidden = false; }
    $("#links").innerHTML = p.links.map(function (l) { return '<a href="' + esc(l.href) + '">' + esc(l.label) + " ↗</a>"; }).join("");
  }

  /* ---------- theme, pause, dock ---------- */
  function chrome() {
    var NAMES = { light: "paper", sepia: "sepia", dark: "night" }, ORDER = ["light", "sepia", "dark"];
    var sys = function () { return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; };
    var cur = function () { return root.dataset.theme || sys(); };
    var btn = $("#theme");
    function sync() {
      btn.querySelector(".lbl").textContent = NAMES[cur()];
      document.querySelectorAll(".fig[data-dark]").forEach(function (a) { a.href = cur() === "dark" ? a.dataset.dark : a.dataset.light; });
    }
    btn.addEventListener("click", function () {
      var n = ORDER[(ORDER.indexOf(cur()) + 1) % 3]; root.dataset.theme = n; try { localStorage.setItem("theme", n); } catch (e) {} sync();
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", sync); sync();

    var pb = $("#pause");
    if (reduce.matches) { pb.hidden = true; pb.nextElementSibling.hidden = true; }
    pb.addEventListener("click", function () {
      var p = pb.getAttribute("aria-pressed") !== "true"; pb.setAttribute("aria-pressed", p);
      pb.querySelector(".ic").textContent = p ? "▶" : "❙❙"; pb.querySelector(".lbl").textContent = p ? "play" : "pause";
      window.SIM && window.SIM.setPaused(p);
    });

    var links = Array.prototype.slice.call(document.querySelectorAll(".dock a")), dock = $(".dock");
    var secs = links.map(function (a) { return document.getElementById(a.dataset.to); });
    function setActive(i) {
      links.forEach(function (a, k) { if (k === i) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current"); });
      dock.style.setProperty("--i", i);
    }
    function spy() {
      var y = window.innerHeight * 0.4, best = 0;
      secs.forEach(function (s, i) { if (s.getBoundingClientRect().top <= y) best = i; });
      if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 4) best = secs.length - 1;
      setActive(best);
      var id = secs[best].id, h = best === 0 ? location.pathname : "#" + id;
      if (armed && (location.hash || "#about") !== "#" + id) history.replaceState(null, "", h);
    }
    var t, armed = false; window.addEventListener("scroll", function () { armed = true; if (t) return; t = requestAnimationFrame(function () { t = 0; spy(); }); }, { passive: true });
    spy();
  }

  hero(); featured(); rows(); calls(); how(); proof(); chrome();
})();
