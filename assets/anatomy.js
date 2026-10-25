/* Renders every view from window.EVIDENCE. No framework; each view reads the same graph. */
(() => {
  const E = window.EVIDENCE;
  const $ = (s, r = document) => r.querySelector(s);
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
    return el;
  };
  const NS = "http://www.w3.org/2000/svg";
  const s = (tag, attrs = {}, text) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (text != null) el.textContent = text;
    return el;
  };
  const byId = Object.fromEntries(E.units.map((u) => [u.id, u]));
  const stageLabel = Object.fromEntries(E.stages.map((x) => [x.id, x.label]));
  const layerLabel = Object.fromEntries(E.layers.map((x) => [x.id, x.label]));
  const yrs = (u) => (u.years[0] === u.years[1] ? `${u.years[0]}` : `${u.years[0]}–${u.years[1]}`);
  const confName = { R: "résumé + site", R1: "résumé", S: "site only", P: "public proof" };
  const unitList = (ids) =>
    h("ul", { class: "unitlist" }, ids.map((id) => {
      const u = byId[id];
      return h("li", {}, h("button", { type: "button", onclick: () => openCase(id) }, h("span", {}, u.title), h("span", { class: "meta" }, yrs(u))));
    }));

  /* ---------- 1. The loop ---------- */
  function renderLoop() {
    const svg = $("#loop-svg"), panel = $("#loop-panel");
    const cx = 260, cy = 215, R = 158;
    const ang = (i) => (-90 + i * 72) * Math.PI / 180;
    const pt = (i, r = R) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
    const defs = s("defs"), marker = s("marker", { id: "ah", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" });
    marker.append(s("path", { d: "M0 0 L10 5 L0 10 z", fill: "#B87333" }));
    defs.append(marker); svg.append(defs);
    E.stages.forEach((_, i) => {
      const a0 = ang(i) + 0.33, a1 = ang(i + 1) - 0.33;
      const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
      svg.append(s("path", { class: "arc", d: `M${p0[0]} ${p0[1]} A${R} ${R} 0 0 1 ${p1[0]} ${p1[1]}`, "marker-end": "url(#ah)" }));
      const [x, y] = pt(i, 62);
      svg.append(s("line", { class: "spoke", x1: x, y1: y, x2: pt(i, R - 34)[0], y2: pt(i, R - 34)[1] }));
    });
    const lp = pt(4.5, R + 24);
    svg.append(s("text", { x: lp[0], y: lp[1], "text-anchor": "middle", fill: "#9C9184", "font-size": 12, "font-style": "italic" }, "learn, publish, repeat"));
    const core = s("g", { class: "core" });
    core.append(s("circle", { cx, cy, r: 62 }));
    core.append(s("text", { x: cx, y: cy - 6, "text-anchor": "middle" }, "CONSTRAINT"));
    const withC = E.units.filter((u) => u.constraint).length;
    core.append(s("text", { class: "s", x: cx, y: cy + 14, "text-anchor": "middle" }, `in ${withC} of ${E.units.length} units`));
    svg.append(core);
    const nodes = E.stages.map((st, i) => {
      const [x, y] = pt(i);
      const ids = E.units.filter((u) => u.stages.includes(st.id)).map((u) => u.id);
      const g = s("g", { class: "node", tabindex: 0, role: "button", "aria-label": `${st.label}: ${ids.length} units` });
      g.append(s("circle", { cx: x, cy: y, r: 34 }));
      g.append(s("text", { class: "n", x, y: y + 1, "text-anchor": "middle" }, st.label));
      g.append(s("text", { class: "c", x, y: y + 17, "text-anchor": "middle" }, `${ids.length}`));
      const pick = () => {
        nodes.forEach((n) => n.classList.remove("on")); g.classList.add("on");
        panel.replaceChildren(h("p", { class: "label" }, `Stage ${i + 1} of 5`), h("h3", {}, st.label), h("p", { class: "sub" }, st.line), h("p", {}, `${ids.length} evidence units use this stage:`), unitList(ids));
        markMapColumn(st.id);
      };
      g.addEventListener("click", pick);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      svg.append(g);
      return g;
    });
    panel.replaceChildren(
      h("p", { class: "label" }, "The core"),
      h("h3", {}, "Every unit starts from a constraint"),
      h("p", {}, "64 MB of RAM. No new headcount. A procurement wall. Sovereign data only. Offline at the edge. The loop runs around whatever the binding limit is."),
      h("ul", { class: "unitlist" }, E.units.filter((u) => u.constraint).map((u) => h("li", {}, h("button", { type: "button", onclick: () => openCase(u.id) }, h("span", {}, u.constraint), h("span", { class: "meta" }, u.org.split(" · ").pop()))))),
    );
  }

  /* ---------- 2. The map ---------- */
  let mapSel = null;
  function markMapColumn(stage) {
    document.querySelectorAll("#map-grid td button").forEach((b) => b.classList.toggle("on", b.dataset.stage === stage));
  }
  function renderMap() {
    const table = $("#map-grid"), panel = $("#map-panel");
    const head = h("tr", {}, h("th", {}), E.stages.map((st) => h("th", { scope: "col" }, st.label)), h("th", {}));
    const rows = E.layers.map((ly) => {
      const all = E.units.filter((u) => u.layers[ly.id]);
      const tr = h("tr", { "data-family": ly.family }, h("th", { class: "row", scope: "row" }, ly.label));
      E.stages.forEach((st) => {
        const here = all.filter((u) => u.stages.includes(st.id));
        const btn = h("button", { type: "button", "data-stage": st.id, "aria-label": `${ly.label} × ${st.label}: ${here.length} units`,
          onclick: () => {
            document.querySelectorAll("#map-grid td button").forEach((b) => b.classList.remove("on")); btn.classList.add("on");
            panel.replaceChildren(h("p", { class: "label" }, `${st.label} × ${ly.label}`),
              h("h3", {}, here.length ? `${here.length} unit${here.length > 1 ? "s" : ""}` : "No evidence here"),
              here.length ? h("p", { class: "sub" }, `${here.filter((u) => u.layers[ly.id] === "hands").length} hands-on · ${here.filter((u) => u.layers[ly.id] === "reason").length} reasoned`) : h("p", {}, "An honest gap. Not every layer gets every stage."),
              here.length ? unitList(here.map((u) => u.id)) : null);
          } },
          here.map((u) => h("span", { class: `dot ${u.layers[ly.id] === "hands" ? "h" : "r"}`, title: u.title })));
        tr.append(h("td", {}, btn));
      });
      const hands = all.filter((u) => u.layers[ly.id] === "hands").length;
      tr.append(h("td", { class: "breadth" }, `${hands} hands-on · ${all.length - hands} reasoned`));
      return tr;
    });
    table.append(h("thead", {}, head), h("tbody", {}, rows));
    const fam = [["all", "All"], ["product", "Product"], ["engineering", "Engineering"], ["market", "Market"], ["human", "Human"], ["aiinfra", "AI infra"]];
    const lens = $("#lens");
    fam.forEach(([id, label]) => lens.append(h("button", { type: "button", "aria-pressed": id === "all" ? "true" : "false", onclick: (e) => {
      lens.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false")); e.currentTarget.setAttribute("aria-pressed", "true");
      table.querySelectorAll("tbody tr").forEach((tr) => tr.classList.toggle("dim", id !== "all" && tr.dataset.family !== id));
    } }, label)));
    const deep = E.layers.map((ly) => [ly.label, E.units.filter((u) => u.layers[ly.id] === "hands").length]).sort((a, b) => b[1] - a[1]);
    panel.replaceChildren(h("p", { class: "label" }, "Reading the map"), h("h3", {}, `Breadth: ${E.layers.filter((ly) => E.units.some((u) => u.layers[ly.id])).length} of ${E.layers.length} layers`),
      h("p", {}, "Each dot is one evidence unit. Gold = built or owned it. Outline = decided, negotiated or researched it. Click any cell."),
      h("p", { class: "sub" }, "Deepest hands-on layers"),
      h("ul", { class: "unitlist" }, deep.slice(0, 4).map(([l, n]) => h("li", {}, h("button", { type: "button", disabled: true }, h("span", {}, l), h("span", { class: "meta" }, `${n} hands-on`))))),
      h("p", { class: "note" }, "AI infrastructure has no hands-on dot yet. That is where the lab is."));
  }

  /* ---------- 3. The path ---------- */
  const CHAIN = [
    [2010, "Constraint engineer"], [2014, "Carrier platform engineer"], [2018, "Reliability owner at scale"], [2019, "Product decision maker"],
    [2024, "Commercial reasoner"], [2025, "Operator-first 0-to-1 builder"], [2026, "Edge & AI builder"], [2026.5, "AI-infrastructure researcher"],
  ];
  function renderPath() {
    const svg = $("#path-svg"), panel = $("#path-panel"), years = $("#years"), chain = $("#chain");
    const X0 = 2010, X1 = 2027, L = 120, W = 980, x = (y) => L + ((y - X0) / (X1 - X0)) * (W - L);
    for (let y = X0; y <= 2026; y += 2) {
      svg.append(s("line", { x1: x(y), y1: 20, x2: x(y), y2: 330, stroke: "rgba(184,115,51,.12)" }));
      const g = s("g", { class: "axis" }); g.append(s("text", { x: x(y), y: 14, "text-anchor": "middle" }, y)); svg.append(g);
    }
    // role bands, greedy rows
    const rows = [];
    E.roles.forEach((r) => {
      let row = rows.findIndex((end) => end <= r.from);
      if (row < 0) { row = rows.length; rows.push(0); }
      rows[row] = r.to;
      const g = s("g", { class: "band" });
      const y = 24 + row * 22;
      g.append(s("rect", { x: x(r.from), y, width: Math.max(8, x(r.to) - x(r.from)), height: 18, rx: 3 }));
      const lab = r.org.split(" · ").pop(); const room = x(r.to) - x(r.from);
      g.append(s("text", { x: x(r.from) + 5, y: y + 13 }, room > 150 ? `${lab} · ${r.role}` : room > 60 ? lab : lab.slice(0, Math.max(3, Math.floor(room / 7)))));
      g.append(s("title", {}, `${r.org} · ${r.role}`));
      svg.append(g);
    });
    const top = 24 + rows.length * 22 + 12;
    const marks = [];
    E.stages.forEach((st, i) => {
      const yy = top + 14 + i * 46;
      const lane = s("g", { class: "lane" });
      lane.append(s("line", { x1: L, y1: yy, x2: W, y2: yy }));
      lane.append(s("text", { x: 0, y: yy + 4 }, st.label.toUpperCase()));
      svg.append(lane);
      E.units.filter((u) => u.stages.includes(st.id)).forEach((u, k) => {
        const off = ((k % 4) - 1.5) * 8;
        const m = s("rect", { class: "mark", x: x(u.years[0]) + 1, y: yy + off - 3, width: Math.max(8, x(u.years[1] + 0.9) - x(u.years[0]) - 2), height: 6, rx: 3, tabindex: 0 });
        m.append(s("title", {}, `${u.title} (${yrs(u)})`));
        m.addEventListener("click", () => openCase(u.id));
        svg.append(m); marks.push([m, u]);
      });
    });
    svg.setAttribute("viewBox", `0 0 1000 ${top + 14 + 5 * 46}`);
    const cursor = s("line", { class: "cursor", x1: 0, y1: 18, x2: 0, y2: top + 5 * 46 });
    svg.append(cursor);
    chain.replaceChildren(...CHAIN.flatMap(([y, l], i) => (i ? [h("em", {}, "→"), h("span", { "data-y": y }, l)] : [h("span", { "data-y": y }, l)])));
    const pick = (Y) => {
      years.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.y === Y)));
      cursor.setAttribute("x1", x(Y + 0.99)); cursor.setAttribute("x2", x(Y + 0.99));
      marks.forEach(([m, u]) => { m.classList.toggle("lit", u.years[0] <= Y); m.classList.toggle("future", u.years[0] > Y); });
      chain.querySelectorAll("span").forEach((sp) => sp.classList.toggle("on", +sp.dataset.y <= Y + 0.99));
      const have = E.stages.filter((st) => E.units.some((u) => u.years[0] <= Y && u.stages.includes(st.id)));
      const roles = E.roles.filter((r) => r.from <= Y + 0.99 && r.to >= Y);
      const units = E.units.filter((u) => u.years[0] <= Y).map((u) => u.id);
      panel.replaceChildren(h("p", { class: "label" }, `By the end of ${Y}`), h("h3", {}, `${have.length} of 5 stages in use`),
        h("p", { class: "sub" }, have.map((st) => st.label).join(" · ") || "—"),
        h("p", {}, roles.length ? `Working as: ${roles.map((r) => `${r.role} (${r.org})`).join("; ")}.` : ""),
        h("p", {}, `${units.length} evidence units so far.`), unitList(units.slice(-5).reverse()));
    };
    for (let y = 2010; y <= 2026; y++) years.append(h("button", { type: "button", "data-y": y, "aria-pressed": "false", onclick: () => pick(y) }, y));
    pick(2026);
  }

  /* ---------- 4. Cases ---------- */
  function openCase(id, scroll = true) {
    const u = byId[id], rail = $("#rail"), box = $("#case");
    rail.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.id === id)));
    const step = (k, v, cls) => (v ? [h("dt", {}, k), h("dd", { class: cls || "" }, v)] : []);
    box.replaceChildren(
      h("h3", {}, u.title), h("p", { class: "org" }, `${u.org} · ${yrs(u)}`, h("span", { class: `conf ${u.conf}`, title: confName[u.conf] }, confName[u.conf])),
      h("dl", { class: "steps" }, step("Problem", u.problem), step("Decision", u.decision, "k"), step("System", u.system), step("Human", u.human), step("Outcome", u.outcome, "k"), step("Learning", u.learning)),
      u.metrics.length ? h("div", { class: "metrics" }, u.metrics.map((m) => h("div", { class: "metric" }, h("b", {}, m.v), h("span", {}, m.label), h("span", { class: `conf ${m.conf}`, title: confName[m.conf] }, confName[m.conf])))) : null,
      u.note ? h("p", { class: "note" }, u.note) : null,
      h("div", { class: "tags" }, u.stages.map((x) => h("span", {}, stageLabel[x])), Object.entries(u.layers).map(([k, v]) => h("span", {}, `${layerLabel[k]} · ${v === "hands" ? "hands-on" : "reasoned"}`))),
      h("div", { class: "proofs" }, u.proof.map((p) => h("a", { href: p.href, target: p.href.startsWith("http") ? "_blank" : null, rel: "noopener" }, `${p.label} ↗`))),
    );
    if (scroll) $("#cases").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function renderCases() {
    const rail = $("#rail");
    const order = ["yvr", "tmobile", "plg", "rakuten", "partners", "mavenir-se", "cisco", "mba", "anomedge", "weatherran", "signal", "camara", "realengine", "ailab", "writing"];
    order.forEach((id) => { const u = byId[id]; rail.append(h("button", { type: "button", role: "tab", "data-id": id, "aria-selected": "false", onclick: () => openCase(id, false) }, u.title, h("small", {}, `${u.org.split(" · ").pop()} · ${yrs(u)}`))); });
    openCase("yvr", false);
  }

  /* ---------- 5. Hard calls ---------- */
  function renderCalls() {
    $("#calls-grid").append(...E.hardCalls.map((c) => h("article", { class: "call" },
      h("p", { class: "k" }, "Tension"), h("p", {}, c.tension), h("p", { class: "k" }, "The call"), h("p", { class: "callp" }, c.call),
      h("p", { class: "k" }, "What it cost"), h("p", {}, c.cost), h("p", { class: "k" }, "Result"), h("p", {}, c.result),
      h("button", { type: "button", onclick: () => openCase(c.unit) }, `Open the case: ${byId[c.unit].org.split(" · ").pop()} →`))));
  }

  /* ---------- 6. AI factory stack ---------- */
  function renderStack() {
    const box = $("#stack"), panel = $("#stack-panel");
    const statusLine = { built: "I have built this", adjacent: "I have worked adjacent to this", exploring: "I am exploring this now", thesis: "I have a thesis about this" };
    const btns = E.aiStack.map((ly, i) => {
      const b = h("button", { type: "button", onclick: () => pick(i) }, h("span", { class: "n" }, String(i + 1).padStart(2, "0")), h("span", {}, ly.label), h("span", { class: `st ${ly.status}` }, ly.status));
      box.append(b); return b;
    });
    const pick = (i) => {
      const ly = E.aiStack[i];
      btns.forEach((b, j) => b.classList.toggle("on", i === j));
      panel.replaceChildren(h("p", { class: "label" }, `Layer ${i + 1} of ${E.aiStack.length}`), h("h3", {}, ly.label),
        h("p", { class: "sub" }, h("span", { class: `st ${ly.status}` }, statusLine[ly.status])), h("p", {}, ly.note),
        ly.units.length ? unitList(ly.units) : h("p", { class: "note" }, "No evidence unit yet. Labelled as a thesis on purpose."));
    };
    pick(6);
    const counts = Object.entries(E.aiStack.reduce((a, l) => ((a[l.status] = (a[l.status] || 0) + 1), a), {}));
    $("#stack-count").textContent = counts.map(([k, n]) => `${n} ${k}`).join(" · ");
  }

  /* ---------- 7. Proof shelf ---------- */
  const ESSAYS = [
    ["He's Not The One Who's Sad", "May 2026", "hes-not-the-one-whos-sad"], ["One Word Costs Five Things", "Apr 2026", "one-word-costs-five-things"],
    ["The Broken Bone Economy", "Apr 2026", "the-broken-bone-economy"], ["The Language of the 15th Floor", "Apr 2026", "the-language-of-the-15th-floor"],
    ["The Careful Review Generation", "Apr 2026", "the-careful-review-generation"], ["The Network Already Knows. Nobody Can Ask It.", "Mar 2026", "the-network-already-knows-nobody"],
    ["Your cell signal drops every time it rains", "Mar 2026", "your-cell-signal-drops-every-time"], ["Your Car Is Screaming. Nobody's Listening.", "Mar 2026", "your-car-is-screaming-nobodys-listening"],
    ["The Weather Forecast Your Radio Never Reads", "Mar 2026", "the-weather-forecast-your-radio-never"], ["The Hidden Scenario of Systemic Absurdity", "Dec 2025", "the-hidden-scenario-of-systemic-absurdity"],
    ["The Factory That Never Broke (But Never Built)", "Jul 2025", "the-factory-that-never-broke-but"],
  ];
  function renderShelf() {
    const tools = E.units.flatMap((u) => u.proof.filter((p) => !p.href.endsWith(".pdf") && !p.href.includes("substack")).map((p) => [p, u]));
    $("#shelf-tools").append(...tools.map(([p, u]) => h("li", {}, h("a", { href: p.href, target: p.href.startsWith("http") ? "_blank" : null, rel: "noopener" }, `${u.title.split(",")[0]} — ${p.label}`), h("span", {}, yrs(u)))));
    $("#shelf-essays").append(...ESSAYS.map(([t, d, slug]) => h("li", {}, h("a", { href: `https://ashutoshukla.substack.com/p/${slug}`, target: "_blank", rel: "noopener" }, t), h("span", {}, d))));
    $("#creds").append(...E.credentials.map((c) => h("span", {}, c)));
  }

  renderLoop(); renderMap(); renderPath(); renderCases(); renderCalls(); renderStack(); renderShelf();
  document.documentElement.classList.add("js");
})();
