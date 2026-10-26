/* The constraint — a character-cell network behind the hero.
   Data flows from sources (left) through one open node to the people who act (right). That node is the constraint:
   packets queue in front of it and the cells around it heat up. A decision (click the node, or the button in the card)
   opens a second path; the queue drains and the heat cools. Then a new constraint forms elsewhere, taken from the
   `sim` fields in evidence.js. Decoration only: the canvas is aria-hidden and every number lives in the DOM readout. */
(function () {
  "use strict";
  var E = window.EVIDENCE;
  var ORDER = ["yvr", "tmobile", "weatherran", "camara", "cisco"];
  var SCEN = ORDER.map(function (id) {
    var u = E.units.find(function (x) { return x.id === id; });
    return u && u.sim ? Object.assign({ id: id, org: u.org }, u.sim) : null;
  }).filter(Boolean);

  var stage = document.querySelector("[data-sim]");
  if (!stage) return;
  var canvas = stage.querySelector("canvas");
  var ctx = canvas.getContext("2d", { alpha: false });
  var bgCanvas = document.createElement("canvas");
  var bgCtx = bgCanvas.getContext("2d");
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");

  var DT = 1 / 60, MAX_STEPS = 4, SPEED = 10; // cells per second
  var C = {}, cw = 10, ch = 15, cols = 0, rows = 0, dpr = 1, font = "";
  var nodes = [], edges = [], packets = [], heat = null, occ = null;
  var S = { scen: 0, cons: 1, open: [1], cleared: false, t: 0, lastInput: 0, clearedAt: 0, flash: 0 };
  var listeners = [], running = false, visible = true, paused = false, acc = 0, last = 0, raf = 0;

  /* ---------- colours from the CSS tokens ---------- */
  function readColors() {
    var cs = getComputedStyle(root);
    ["bg", "ink", "text", "muted", "faint", "rule2", "sig", "sig-text", "ev"].forEach(function (k) { C[k] = cs.getPropertyValue("--" + k).trim() || "#888"; });
  }

  /* ---------- layout ---------- */
  function zone() {
    // The network lives where the hero card is not: right of it on wide screens, below it on narrow ones.
    var r = stage.getBoundingClientRect(), card = document.querySelector("[data-sim-avoid]");
    var z = { x0: 2, y0: 2, x1: cols - 3, y1: rows - 3 };
    if (card) {
      var c = card.getBoundingClientRect();
      if (c.width < r.width * 0.62) { z.x0 = Math.ceil((c.right - r.left) / cw) + 4; z.y0 = Math.ceil(70 / ch); }
      else if (c.top - r.top > 220) { z.y0 = Math.ceil(78 / ch); z.y1 = Math.floor((c.top - r.top) / ch) - 2; return z; } // phone: network above the card
      else z.y0 = Math.ceil((c.bottom - r.top) / ch) + 2;
    }
    var bottomPad = Math.ceil(110 / ch); // keep clear of the dock
    z.y1 = Math.max(z.y0 + 8, rows - bottomPad);
    return z;
  }

  function route(a, b, f) { // right-angle route a → b: across, down or up at a column part-way, then across
    var pts = [], x, y = a[1], mx = Math.round(a[0] + (b[0] - a[0]) * f);
    for (x = a[0]; x !== mx; x += a[0] < mx ? 1 : -1) pts.push([x, y]);
    for (; y !== b[1]; y += y < b[1] ? 1 : -1) pts.push([mx, y]);
    for (x = mx; ; x += mx < b[0] ? 1 : -1) { pts.push([x, b[1]]); if (x === b[0]) break; }
    return pts;
  }
  var GL = { LR: "─", DU: "│", DL: "┐", LU: "┘", DR: "┌", RU: "└", L: "─", R: "─", U: "│", D: "│" };
  function glyphs(cells) {
    return cells.map(function (c, i) {
      var d = [];
      [cells[i - 1], cells[i + 1]].forEach(function (n) { if (!n) return; d.push(n[0] < c[0] ? "L" : n[0] > c[0] ? "R" : n[1] < c[1] ? "U" : "D"); });
      return GL[d.sort().join("")] || "─";
    });
  }
  function edge(from, to, kind, outRow, inRow, f) {
    var a = nodes[from], b = nodes[to];
    var p0 = [a.x + a.w + 2, a.y + (outRow || 0)], p1 = [b.x - b.w - 2, b.y + (inRow || 0)];
    var cells = route(p0, p1, f == null ? 0.5 : f);
    var e = { from: from, to: to, kind: kind, cells: cells, gl: glyphs(cells), list: [] };
    edges.push(e);
    return e;
  }

  function build() {
    var r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = Math.max(8, Math.min(13, Math.round(window.innerWidth / 124)));
    ch = Math.round(cw * 1.45);
    cols = Math.floor(r.width / cw); rows = Math.floor(r.height / ch);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
    font = "500 " + Math.round(cw * 1.5) + "px 'JetBrains Mono', ui-monospace, Menlo, monospace";

    var z = zone(), W = z.x1 - z.x0, H = z.y1 - z.y0, X = function (f) { return Math.round(z.x0 + W * f); }, Y = function (f) { return Math.round(z.y0 + H * f); };
    nodes = []; edges = []; packets = [];
    var small = W < 40;
    // sources 0-2, merge 3, middle 4-6, split 7, people 8-10
    var bw = small ? 2 : 3;
    [0.12, 0.5, 0.88].forEach(function (f) { nodes.push({ kind: "src", x: X(0.01), y: Y(f), w: 0, r: 0 }); });
    nodes.push({ kind: "hub", x: X(0.25), y: Y(0.5), w: bw, r: 2 });
    [0.12, 0.5, 0.88].forEach(function (f) { nodes.push({ kind: "mid", x: X(0.53), y: Y(f), w: bw, r: 1, rate: 0, timer: 0 }); });
    nodes.push({ kind: "hub", x: X(0.8), y: Y(0.5), w: bw, r: 2 });
    [0.12, 0.5, 0.88].forEach(function (f) { nodes.push({ kind: "ppl", x: X(0.99), y: Y(f), w: 0, r: 0, pulse: 0 }); });
    var F = [0.62, 0.5, 0.38];
    for (var i = 0; i < 3; i++) edge(i, 3, "in", 0, i - 1, F[i]);
    for (i = 4; i < 7; i++) edge(3, i, "toMid", i - 5, 0, F[i - 4]);
    for (i = 4; i < 7; i++) edge(i, 7, "fromMid", 0, i - 5, 1 - F[i - 4]);
    for (i = 8; i < 11; i++) edge(7, i, "out", i - 9, 0, 1 - F[i - 8]);
    nodes.forEach(function (n, k) { n.out = edges.filter(function (e) { return e.from === k; }); });
    S.rate = small ? 1.1 : 1.6; // packets per second per source
    heat = new Float32Array(cols * rows);
    occ = new Uint8Array(cols * rows);
    edges.forEach(function (e) { e.cells.forEach(function (c) { mark(c[0], c[1]); }); });
    nodes.forEach(function (n) { for (var dx = -n.w - 1; dx <= n.w + 1; dx++) for (var dy = -n.r - 1; dy <= n.r + 1; dy++) mark(n.x + dx, n.y + dy); });
    if (!S.built) { S.built = true; applyScenario(false); } else restoreRates();
    prerender();
  }
  function mark(x, y) { if (x >= 0 && y >= 0 && x < cols && y < rows) occ[y * cols + x] = 1; }

  function prerender() {
    readColors();
    bgCanvas.width = canvas.width; bgCanvas.height = canvas.height;
    var g = bgCtx; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = C.bg; g.fillRect(0, 0, canvas.width, canvas.height);
    g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = C.faint; g.globalAlpha = 0.55;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) if (!occ[y * cols + x] && (x + y) % 2 === 0) g.fillText("·", x * cw + cw / 2, y * ch + ch / 2);
    g.globalAlpha = 1;
  }

  /* ---------- scenario ---------- */
  function applyScenario(advance) {
    if (advance) {
      S.scen = (S.scen + 1) % SCEN.length;
      var choices = [0, 1, 2].filter(function (i) { return i !== S.cons; });
      S.cons = choices[(S.scen + choices.length) % choices.length];
    }
    S.open = [S.cons]; S.woke = []; S.cleared = false; S.lastInput = S.t; S.clearedAt = 0;
    nodes.forEach(function (n, k) { if (n.kind === "mid") n.rate = k - 4 === S.cons ? 0.9 : 0; });
    emit();
  }
  function restoreRates() {
    nodes.forEach(function (n, k) { if (n.kind === "mid") n.rate = S.open.indexOf(k - 4) < 0 ? 0 : S.cleared ? 4.2 : 0.9; });
  }
  function clear(byUser) {
    if (S.cleared) return;
    S.cleared = true; S.clearedAt = S.t; S.flash = 1;
    if (byUser) S.lastInput = S.t;
    S.woke = [0, 1, 2].filter(function (i) { return i !== S.cons; }); // the idle paths go to work
    S.open = [S.cons].concat(S.woke);
    nodes.forEach(function (n, k) { if (n.kind === "mid" && S.open.indexOf(k - 4) >= 0) n.rate = 4.2; });
    emit();
    if (!running) draw();
  }
  function emit() {
    var sc = SCEN[S.scen], st = { scenario: sc, cleared: S.cleared, index: S.scen, total: SCEN.length };
    listeners.forEach(function (fn) { fn(st); });
  }

  /* ---------- simulation ---------- */
  function free(e, pos) { // is cell index `pos` on edge e at least one cell clear of every packet?
    for (var i = 0; i < e.list.length; i++) if (Math.abs(e.list[i].t - pos) < 1.05) return false;
    return true;
  }
  function step(dt) {
    S.t += dt;
    // sources emit
    for (var s = 0; s < 3; s++) {
      var n = nodes[s]; n.timer = (n.timer || Math.random()) - dt * S.rate;
      if (n.timer <= 0) { var e0 = n.out[0]; if (free(e0, 0)) { var p = { e: e0, t: 0 }; e0.list.push(p); packets.push(p); n.timer = 1; } else n.timer = 0.2; n.waiting = !free(e0, 0); }
    }
    // move packets, front-most first so spacing holds
    edges.forEach(function (e) {
      e.list.sort(function (a, b) { return b.t - a.t; });
      var end = e.cells.length - 1;
      for (var i = 0; i < e.list.length; i++) {
        var p = e.list[i], limit = i === 0 ? end : e.list[i - 1].t - 1.1;
        p.t = Math.min(limit, p.t + SPEED * dt);
        if (i === 0 && p.t >= end - 0.001) handoff(e, p);
      }
    });
    // service timers on middle nodes
    nodes.forEach(function (n) { if (n.kind === "mid") n.timer = Math.max(0, n.timer - dt); if (n.pulse) n.pulse = Math.max(0, n.pulse - dt * 2); });
    // heat around the constraint
    var cn = nodes[4 + S.cons], inEdge = edges.find(function (e) { return e.to === 4 + S.cons; });
    var q = inEdge.list.length / Math.max(1, inEdge.cells.length * 0.8);
    var R = 7;
    for (var dy = -R; dy <= R; dy++) for (var dx = -R * 1.5; dx <= R * 1.5; dx++) {
      var x = Math.round(cn.x + dx), y = cn.y + dy; if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      var d = Math.sqrt((dx / 1.5) * (dx / 1.5) + dy * dy) / R, target = d < 1 && !S.cleared ? Math.min(1, q * 1.3) * (1 - d) * (1 - d) : 0;
      var k = y * cols + x; heat[k] += (target - heat[k]) * Math.min(1, dt * (target > heat[k] ? 1.2 : 2.4));
    }
    if (S.flash) S.flash = Math.max(0, S.flash - dt * 1.5);
    // idle visitors: clear by itself after 10 s, then a new constraint 10 s after that
    if (!S.cleared && S.t - S.lastInput > 4.5) clear(false);
    if (S.cleared && S.t - Math.max(S.clearedAt, S.lastInput) > 9) applyScenario(true);
  }
  function remove(e, p) { e.list.splice(e.list.indexOf(p), 1); }
  function handoff(e, p) {
    var to = nodes[e.to];
    if (to.kind === "hub" && e.kind === "in") { // merge: pick the open middle node with the shortest queue
      var best = null;
      S.open.forEach(function (i) { var ne = to.out[i]; if (free(ne, 0) && (!best || ne.list.length < best.list.length)) best = ne; });
      if (best) { remove(e, p); p.e = best; p.t = 0; best.list.push(p); }
    } else if (to.kind === "mid") {
      if (to.timer <= 0 && to.rate > 0 && free(to.out[0], 0)) { remove(e, p); p.e = to.out[0]; p.t = 0; to.out[0].list.push(p); to.timer = 1 / to.rate; }
      else if (to.rate === 0 && free(to.out[0], 0)) { remove(e, p); p.e = to.out[0]; p.t = 0; to.out[0].list.push(p); } // closed node: let stragglers through
    } else if (to.kind === "hub") {
      var ne2 = to.out[(Math.random() * 3) | 0];
      if (free(ne2, 0)) { remove(e, p); p.e = ne2; p.t = 0; ne2.list.push(p); }
    } else if (to.kind === "ppl") { remove(e, p); packets.splice(packets.indexOf(p), 1); to.pulse = 1; }
  }

  /* ---------- drawing ---------- */
  var RAMP = " ·:-=+*#%";
  function put(g, x, y) { ctx.fillText(g, x * cw + cw / 2, y * ch + ch / 2 + 1); }
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bgCanvas, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var cn = nodes[4 + S.cons];
    // heat
    ctx.fillStyle = C.muted;
    var R = 11;
    for (var y = Math.max(0, cn.y - R); y < Math.min(rows, cn.y + R); y++) for (var x = Math.max(0, cn.x - R * 1.6 | 0); x < Math.min(cols, cn.x + R * 1.6); x++) {
      var h = heat[y * cols + x]; if (h < 0.05 || occ[y * cols + x]) continue;
      ctx.globalAlpha = Math.min(0.7, 0.1 + h * 0.8); put(RAMP[Math.min(RAMP.length - 1, 1 + (h * (RAMP.length - 1)) | 0)], x, y);
    }
    ctx.globalAlpha = 1;
    // edges
    edges.forEach(function (e) {
      var mid = e.kind === "toMid" ? e.to - 4 : e.kind === "fromMid" ? e.from - 4 : -1;
      var open = mid < 0 || S.open.indexOf(mid) >= 0;
      ctx.fillStyle = open ? C.muted : C.faint; ctx.globalAlpha = open ? 0.8 : 0.9;
      e.cells.forEach(function (c, i) { put(open ? e.gl[i] : (i % 2 ? " " : e.gl[i]), c[0], c[1]); });
    });
    ctx.globalAlpha = 1;
    // nodes
    nodes.forEach(function (n, k) {
      if (n.kind === "src") { ctx.fillStyle = C.ev; put("▤", n.x, n.y); }
      else if (n.kind === "ppl") { ctx.fillStyle = n.pulse > 0.2 ? C.ev : C.ink; put("o", n.x, n.y - 1); put("╨", n.x, n.y); }
      else {
        var isC = k === 4 + S.cons, open = n.kind === "hub" || S.open.indexOf(k - 4) >= 0, isCall = k === 3 && S.cleared;
        ctx.fillStyle = isCall ? C.sig : isC && !S.cleared ? C.ink : open ? C.ink : C.muted;
        ctx.globalAlpha = open || isC ? 1 : 0.7;
        var x0 = n.x - n.w - 1, x1 = n.x + n.w + 1, y0 = n.y - n.r - 1, y1 = n.y + n.r + 1, xx, yy;
        put("┌", x0, y0); put("┐", x1, y0); put("└", x0, y1); put("┘", x1, y1);
        for (xx = x0 + 1; xx < x1; xx++) { put("─", xx, y0); put("─", xx, y1); }
        for (yy = y0 + 1; yy < y1; yy++) { put("│", x0, yy); put("│", x1, yy); }
        for (yy = y0 + 1; yy < y1; yy++) for (xx = x0 + 1; xx < x1; xx++) put(isC && !S.cleared ? "▒" : open ? ((xx + yy) % 2 ? "·" : " ") : " ", xx, yy);
        ctx.globalAlpha = 1;
      }
    });
    // packets
    packets.forEach(function (p) {
      var c = p.e.cells[Math.round(p.t)]; if (!c) return;
      var queued = p.e.to === 4 + S.cons && p.e.kind === "toMid" && !S.cleared && p.t < p.e.cells.length - 1 - 0.05 && p.t > 0;
      ctx.fillStyle = queued ? C.ink : C.ev; put(queued ? "▪" : "•", c[0], c[1]);
    });
    // plain-word labels on the drawing itself
    var sc = SCEN[S.scen], M = nodes[3];
    ctx.font = "500 " + Math.max(11, Math.round(cw * 1.15)) + "px 'JetBrains Mono', ui-monospace, monospace";
    function label(t, x, y, align, color) {
      ctx.textAlign = align; ctx.fillStyle = color;
      var px = x * cw + (align === "left" ? 0 : align === "right" ? cw : cw / 2);
      if (align === "left" && px + t.length * cw * 0.95 > cols * cw) { ctx.textAlign = "right"; px = cols * cw - cw; }
      ctx.fillText(t, px, y * ch + ch / 2);
    }
    label("data", nodes[0].x, nodes[0].y - 1.6, "left", C.ev);
    label("people who act", nodes[8].x, nodes[8].y - 2.6, "right", C.ink);
    nodes.forEach(function (n, k) {
      if (n.kind !== "mid") return;
      if (S.open.indexOf(k - 4) < 0) label("idle", n.x, n.y, "center", C.muted);
      else if (S.cleared && S.woke && S.woke.indexOf(k - 4) >= 0) label("now working", n.x - n.w - 1, n.y - n.r - 2.3, "left", C.ev);
    });
    var roomy = cols >= 70;
    if (S.cleared && roomy) { ctx.globalAlpha = 0.6; label("was stuck · " + sc.label, cn.x - cn.w - 1, cn.y - cn.r - 2.3, "left", C.muted); ctx.globalAlpha = 1; }
    else if (!S.cleared) label("stuck · " + sc.label, cn.x - cn.w - 1, cn.y - cn.r - 2.3, "left", C.ink);
    if (S.cleared) {
      label("the call", M.x - M.w - 1, M.y - M.r - 2.3, "left", C["sig-text"]);
      if (roomy) label(sc.what + " " + (sc.before ? sc.before + " → " : "") + sc.after, M.x - M.w - 1, M.y + M.r + 2.4, "left", C["sig-text"]);
    }
    if (S.flash) { ctx.strokeStyle = C.sig; ctx.globalAlpha = S.flash; ctx.lineWidth = 1.5; var rr = (1 - S.flash) * 6 + 2; ctx.strokeRect((M.x - M.w - 1 - rr) * cw, (M.y - M.r - 1 - rr * 0.7) * ch, (2 * M.w + 3 + 2 * rr) * cw, (2 * M.r + 3 + rr * 1.4) * ch); ctx.globalAlpha = 1; }
  }

  /* ---------- loop, pause, visibility ---------- */
  function frame(now) {
    raf = 0; if (!running) return;
    var dt = Math.min(0.25, (now - (last || now)) / 1000); last = now; acc += dt;
    var n = 0; while (acc >= DT && n < MAX_STEPS) { step(DT); acc -= DT; n++; }
    if (n === MAX_STEPS) acc = 0;
    draw(); raf = requestAnimationFrame(frame);
  }
  function update() {
    var should = visible && !paused && !reduce.matches && !document.hidden;
    if (should && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
    if (!should && running) { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  }
  function stillFrame() { // reduced motion: settle the network, clear the constraint, draw once
    for (var i = 0; i < 360; i++) step(DT);
    clear(false); for (i = 0; i < 300; i++) step(DT);
    S.flash = 0; draw();
  }
  function hit(ev) {
    var r = canvas.getBoundingClientRect(), x = (ev.clientX - r.left) / cw, y = (ev.clientY - r.top) / ch, cn = nodes[4 + S.cons];
    return Math.abs(x - cn.x - 0.5) <= cn.w + 5 && Math.abs(y - cn.y - 0.5) <= cn.r + 4;
  }

  function start() {
    build();
    if (reduce.matches) stillFrame(); else draw();
    update();
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; update(); }).observe(stage);
    document.addEventListener("visibilitychange", update);
    reduce.addEventListener && reduce.addEventListener("change", function () { if (reduce.matches) stillFrame(); update(); });
    var t, lastW = window.innerWidth, lastH = window.innerHeight;
    window.addEventListener("resize", function () {
      if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 120) return; // phone URL bar: keep going
      lastW = window.innerWidth; lastH = window.innerHeight;
      clearTimeout(t); t = setTimeout(function () { build(); if (reduce.matches) stillFrame(); else draw(); }, 150);
    });
    new MutationObserver(function () { prerender(); draw(); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { prerender(); draw(); });
    canvas.addEventListener("pointermove", function (ev) { S.lastInput = S.t; canvas.style.cursor = hit(ev) && !S.cleared ? "pointer" : ""; });
    canvas.addEventListener("click", function (ev) { if (hit(ev)) clear(true); });
  }

  window.SIM = {
    clear: function () { clear(true); },
    next: function () { applyScenario(true); if (!running) { if (reduce.matches) stillFrame(); else draw(); } },
    onState: function (fn) { listeners.push(fn); fn({ scenario: SCEN[S.scen], cleared: S.cleared, index: S.scen, total: SCEN.length }); },
    setPaused: function (v) { paused = v; update(); },
    isPaused: function () { return paused || reduce.matches; },
  };
  var go = function () { (window.requestIdleCallback || setTimeout)(start); };
  if (document.readyState === "complete") go(); else window.addEventListener("load", go);
})();
