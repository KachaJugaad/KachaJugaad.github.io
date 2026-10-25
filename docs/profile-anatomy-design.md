# Professional anatomy — Ashutosh Shukla (design document, 2026-10-25)

Sources read in full: kachajugaad.github.io `index.html` (3,170 words, all sections incl. collapsed briefs), `Ashutosh_Shukla_Resume.pdf` (812 words), the AI-factory lab and UE brief pages. Proof links: 4 live tools, 1 GitHub repo, 11 Substack posts, 1 LinkedIn event post, 2 live anatomy figures, 1 brief + fact check.

---

## 1. Content inventory

| Source | Units | Notes |
|---|---|---|
| Hero + stats + leadership strip | 9 claims | 4 metrics, identity line, "15 years", employer strip |
| Credentials | 7 | CSPO, CSM, PMP, KCNA, AWS, Terraform, MBA |
| Domain marquee | 22 buzzwords | Fails the design test (buzzword cloud) → remove |
| The Thread | 3 problem statements + 1 pattern line + 4 steps | The strongest existing insight |
| Work | 3 case studies (YVR, T-Mobile Digits, Rakuten Link), 13 metrics | |
| Projects | 5 (WeatherRAN, Signal Forecast, AnomEdge, CAMARA, realEngine), 20 metrics | All with live/proof links |
| Thinking | 4 principles | Mental models |
| Writing | 11 posts | 2025-07 → 2026-05 |
| Briefs / AI lab | 1 brief, 2 live figures, 1 poster, 6-layer ladder | 2026-10 |
| What's next | 3 problem briefs (OVN fabric, defense edge, career insurance) | Thesis material |
| Résumé | 6 roles, 3 projects, education, competencies | Adds: Cisco 64 MB constraint, 90/10→50/50 rebalance, Samsung/Apple/Amazon negotiation, IMS/RCS/SIP, 15+ operator interviews, 7-month delivery |

## 2. Evidence map (atomic units)

Confidence: **R** = on résumé and site (consistent) · **S** = site only · **R1** = résumé only · **P** = public artifact you can open.

| # | What I did | Why it mattered | Layers (T/P/H/B) | Decision / trade-off | Outcome | Proof | Lesson | Conf. |
|---|---|---|---|---|---|---|---|---|
| E1 | Built real-time video streaming under 64 MB RAM, 6-year lifecycle (Cisco 2010–14) | Software had to outlive hardware | Software, embedded | Design for years without redesign | Shipped | Résumé | Constraint-first thinking | R1 |
| E2 | Built IMS Core / RCS / SIP platform components; extensibility patterns for partners (Mavenir 2014–18) | Carrier-grade production | Software, network | Extensibility vs speed | Patterns used by partners | Résumé | Build for others to extend | R1 |
| E3 | Scaled Kubernetes microservices to millions of sessions; defined SLOs (Rakuten Link 2018–21) | Zero tolerance for failure | Infra, ops | Performance–cost–operability | 99.99% uptime | Résumé + site | Define "done" before validation | R |
| E4 | Built observability for API gateways; API standards | Firefighting → proactive | Infra, ops | Invest in telemetry over features | −20% integration failures; +30% eng capacity | Résumé + site | Telemetry buys capacity | R |
| E5 | — support tickets | | | | −20% support tickets | Site only | | S |
| E6 | Rebalanced investment 90/10 → 50/50 feature/stability; defended to sales and engineering (T-Mobile Digits 2019–24) | SLA penalties trending to $2M/quarter | Product, human, business | Stability over features, against two camps | Stability targets in 6 months; quality record won Rakuten | Résumé + site ($2M+ SLA) | Say no to the loudest room | R |
| E7 | Simplified API contracts, self-serve partner integrations for underserved SMB/enterprise | PLG motion | Product, market, software | Simplicity over customization | ~30% incremental revenue, zero added ops load | Résumé + site | Contracts are the product | R |
| E8 | Owned API-first roadmap, RICE, decoupled releases | Calendar-driven releases | Product | Readiness over dates | −25% time-to-market (12→9 wks) | Résumé + site | Ship by readiness | R |
| E9 | Negotiated API data-sharing contracts with Samsung, Apple, Amazon (40+ device types); QBRs to C-suite | Partner ecosystem | Business, human | — | Contracts signed | Résumé | — | R1 |
| E10 | — downtime | | | | −15% downtime | Site only | | S |
| E11 | Career transition Principal Engineer → PM; UBC Sauder MBA (Tech & Analytics) 2024–26 | Add commercial reasoning | Business | Reinvent mid-career | MBA | Résumé + site | MBA as "Rosetta Stone" | R |
| E12 | YVR 0-to-1 fleet decision support in a new domain; embedded with ground crews, 15+ operator interviews; PRDs; delivered in 7 months | Peak ops on gut instinct | Product, human, ops | No new headcount, systems or budget | −50% idle time (20→10%), ~$500K downtime prevented | Résumé + site | Talk to operators before specs | R |
| E13 | — "decision-support product integrating AI agents with Maximo data" | | AI layer | | | Site only (résumé says fleet analytics) | | S |
| E14 | — 99% continuity at peak | | | | | Site only | | S |
| E15 | WeatherRAN: O-RAN xApp pre-adjusting radio using Gov. of Canada forecasts; 9 standards cited | Rural 5G drops in weather | RAN, ML, edge | Sovereign data only | 5.3% BER (prairie), 332 tests; published Arctic 0.0% | Live dashboard + Substack | Publish the null result | P |
| E16 | Signal Forecast: 32,756 ISED tower sites × live weather, per postal code | No carrier-independent reliability view | RF, data | No carrier dependency | 100% postal codes, 6 scenarios | Live tool | Public data can beat private maps | P |
| E17 | AnomEdge: three-tier edge inference in Rust, offline | Fleet failures found too late | Edge AI | Graceful degradation over peak accuracy | <100 ms p99, 145 tests, 2nd place ProductBC 2026 | Live site + LinkedIn | Design the fallback | P |
| E18 | CAMARA Sandbox: carrier APIs without procurement | Developers blocked by contracts | API, DX | Remove friction instead of adding features | 90 s to first call, 53 tests, 3 APIs | GitHub repo | The obstacle is the product | P |
| E19 | realEngine: AI-media detection, web + Android | Can't tell real from generated | AI app | Probabilities, not false certainty; 60 s deletion | <8 s verdict | Live site | Honest confidence | P |
| E20 | AI factory lab: read UE 1.1, OCP NIC, ESUN; two live models; UE NIC profile proposal | Learn AI infra from the spec up | AI infra | Claim only what a page supports | 2 figures, 1 brief, fact check | Site pages | Read the spec, write the gap | P |
| E21 | 11 essays (2025–26) on AI economics, org language, hiring, telecom, edge | Thinking in public | Market, human | — | Published | Substack | — | P |
| E22 | Next-problem briefs: mixed-vendor fabric, defense edge, career insurance | Where thinking is heading | Infra, edge, fintech | — | Briefs | Site | — | S (thesis) |

**Flags (claim vs evidence)**

1. **Years.** Site "15 years"; résumé summary "10+ years"; dates Aug 2010 → Jan 2026 ≈ 15.5 years. Your brief says ~16. → Page uses **"since 2010"**.
2. **Date conflicts.** Rakuten Link: site 2017–2021, résumé 2018–2021. Cisco ends Dec 2014 but Mavenir starts Jan 2014. → Page uses résumé dates; please confirm.
3. **Sequence tension.** Résumé: the 2019–24 stability rebalance "won Rakuten as a new customer"; but Rakuten Link work started 2018. → Kept as written; please confirm the order.
4. **Site-only metrics** (E5, E10, E14) and the "AI agents with Maximo" claim (E13) are not on the résumé. → Kept in the data with confidence "site-only", shown in the case detail but not as headline numbers.
5. **"$2.5M+ prevented"** = $2M SLA trend + $500K downtime; the $2M is a quarterly *trend avoided*, not booked savings. → Worded "SLA exposure avoided".

## 3. Professional anatomy model

The evidence does not support "PM + engineer + AI". It shows one repeated loop, run under a binding constraint, at whatever layer the problem lives:

```
            ┌──────────── CONSTRAINT (the core) ────────────┐
            │ 64 MB RAM · no headcount · no budget ·         │
            │ procurement wall · sovereign data only ·       │
            │ SLA penalties · offline at the edge            │
            └───────────────────────┬────────────────────────┘
   SENSE ─────► DECIDE ─────► BUILD ─────► RUN ─────► SPREAD ──┐
   operators,   trade-offs,   APIs, k8s,   SLOs,      contracts, │
   field data,  KPIs first,   edge, RF,    telemetry, revenue,   │
   discovery    say no        models       SOPs       writing    │
     ▲                                                           │
     └──────────────────────── LEARN (publish, incl. nulls) ◄────┘
```

- **Sense** (find the signal): E12, E15, E16, E18, E20
- **Decide** (product judgment): E6, E7, E8, E12
- **Build** (go down the stack): E1, E2, E3, E15–E19
- **Run** (operate it): E3, E4, E12
- **Spread** (commercialize/adopt): E2, E7, E9, E18, E21
- **Constraint** appears in 12 of the 15 published units (computed on the page) — the deepest pattern. The contact line already names it: *"find the constraint. Build the fix."*

**Breadth × depth** — the same units placed on seven stack layers (hands-on = built/owned it; reasoned = decided, negotiated or researched):

| Layer | Hands-on | Reasoned | Strongest unit |
|---|---|---|---|
| Market / business | E7, E9 | E11, E21, E22 | 30% incremental revenue |
| Product | E6, E8, E12 | E20 | 90/10 → 50/50 |
| Humans | E12, E6, E9 | E21 | 15+ operators embedded |
| Software / APIs | E2, E7, E18 | | CAMARA 90 s |
| Infrastructure / ops | E3, E4 | E22 | 99.99% uptime |
| Edge / RAN / embedded | E1, E15, E17 | E16 | AnomEdge <100 ms |
| AI infrastructure | — | E20, E22 | Exploring (lab) |
| AI / models / apps | E17, E19, E15 | E13 (site-only) | three-tier inference |

**Capability accumulation (evidence-backed transitions only)**

Constraint engineer (Cisco) → carrier platform engineer (IMS/SIP) → reliability owner at scale (Rakuten Link) → product decision maker (T-Mobile Digits) → commercial reasoner (MBA) → operator-first 0-to-1 builder (YVR) → independent builder of edge/AI tools (2025–26) → AI-infrastructure researcher (lab, 2026).

## 4. Central narrative

**Headline (kept, it is his voice):** I find the expensive problem hiding in your platform.
**One-line answer:** Then I go down the stack — from the operator's shift to the API, the cluster, the edge device — and build the decision layer that was missing. Under a constraint, every time.
**Why it's rare:** 7 years building carrier and embedded systems, 5 years owning product decisions on a 1M-user platform, an MBA, and 0-to-1 work in a domain he'd never seen — in one person, with live proof.
**Where it's heading:** the same loop, applied to AI factories — where the constraint is the network.

AI is an amplifier in this story (E15, E17, E19 use models; E20 uses specs), not the identity.

## 5. Information architecture (Scan → Grasp → Explore → Verify)

| # | Section | Visitor learns | Stage |
|---|---|---|---|
| 0 | Hero: headline, one-line answer, 4 proof numbers, "since 2010" | Who, what problems, that it's proven | Scan (5 s) |
| 1 | **The loop** — interactive anatomy (constraint core + 5 stages) | How he works, as a mechanism | Grasp (30 s) |
| 2 | **The map** — 8 layers × 5 stages evidence grid | Breadth (how many layers) and depth (where hands-on) | Grasp/Explore |
| 3 | **The path** — capability accumulation over time | How the capabilities stacked up, and in what order | Explore |
| 4 | **Cases** — Problem → Decision → System → Human challenge → Outcome → Learning | Judgment in context | Explore |
| 5 | **Hard calls** — human-star moments | Judgment under conflict | Explore |
| 6 | **Next: the AI factory** — 11-layer stack with Built / Adjacent / Exploring / Thesis + live figures + brief | Where thinking is heading, honestly | Explore/Verify |
| 7 | **Proof shelf** — tools, repos, essays, credentials | Verify | Verify |
| 8 | Contact | — | — |

Removed: domain marquee (buzzwords), duplicate "leadership strip" (merged into hero), logo strip (moved to the path view), separate Thinking section (its four principles become the "Learning" of the cases they came from).

## 6. Page wireframe

```
[nav: Loop · Map · Path · Cases · Hard calls · AI factory · Proof · Contact]
HERO  headline / one-line answer / 4 numbers with source tags / CTA
LOOP  [ SVG: constraint core, 5 stage nodes, arcs ]   [ panel: stage → units ]
MAP   [ grid 8 rows × 5 cols, cell dot = # units, filled = hands-on ] [ panel ]
       lens toggles: All · Product · Engineering · Market · Human · AI infra
PATH  [ timeline 2010→2026, 5 swimlanes, role bands ]   [ year panel ]
CASES [ case rail ]  [ 6-step decision card ]
HARD  [ 6 moments: tension → call → cost → result ]
AI FACTORY [ 11-layer stack, status markers ] [ layer panel ] [ Fig 1 · Fig 2 · Brief ]
PROOF [ tools · repo · essays · credentials ]
CONTACT
```

## 7. Interaction model

- Hover/click a **loop stage** → highlight units and the matching map column.
- Click a **map cell** → list the units there; click a unit → open its case.
- **Lens toggle** filters the map and path by layer family.
- Click a **year** → path shows capabilities present by that year (cumulative).
- Click a **case** → 6-step card; proof links and confidence tag.
- Click an **AI-factory layer** → status, linked units, figures.
- Keyboard: every control is a button; panels are aria-live. Reduced motion: no transitions.

## 8. Visual design system

Keep the site's warm-dark identity (copper/gold on near-black; Playfair Display headings, Source Serif body, JetBrains Mono labels, DM Sans UI). Rules: one accent (gold) for "selected/hands-on"; copper for structure; muted for reasoned/adjacent; dashed outlines for thesis. No gradients, no glass, no skill bars. Every visual encodes structure (loop), magnitude (grid dots), sequence (path) or evidence (cards).

## 9. Structured content schema

```js
unit = { id, title, org, years:[from,to], kind:"role"|"project"|"research"|"writing",
  problem, decision, system, human, outcome, learning,
  stages:["sense"|"decide"|"build"|"run"|"spread"], constraint,
  layers:{ market|product|humans|software|infra|edge|aiinfra|ai : "hands"|"reason" },
  metrics:[{v,label,conf}], proof:[{label,href}], conf:"R"|"S"|"R1"|"P" }
aiStack = [{ id, label, status:"built"|"adjacent"|"exploring"|"thesis", units:[ids], note }]
roles = [{ org, role, years }]   // for the path bands
```

## 10. Component architecture

`/index.html` (shell + semantic fallbacks) · `/assets/evidence.js` (the graph above, one source of truth) · `/assets/anatomy.js` (renders Loop, Map, Path, Cases, Hard calls, AI stack from the graph; no framework) · `/assets/anatomy.css`. The previous page is kept at `/v1/` (not linked) so nothing is lost. Existing `/lab/` and `/briefs/` pages are unchanged and linked from the AI-factory view.

## 11. Implementation

Vanilla HTML/CSS/JS + inline SVG drawn from the data; works on GitHub Pages and from `file://`; progressive enhancement (cases and proof render as plain HTML if JS fails).

## 12. Build notes (2026-10-25)

- The 22 draft units became 15 published units: site-only metrics (E5, E10, E14) and the "AI agents" note (E13) live inside their parent cases with a "site only" tag; E21 is the "Thinking in public" unit; E22 became the three thesis cards.
- All counts on the page (stage totals, constraint share, breadth, AI-stack status mix) are computed from `assets/evidence.js`, so they cannot drift from the data.
- Open items for the owner: confirm Rakuten Link start year (2017 vs 2018), the Cisco/Mavenir 2014 overlap, the order of the stability rebalance vs the Rakuten win, and the project years (WeatherRAN, Signal Forecast, CAMARA and realEngine are dated 2026 from their essays and the ProductBC event).
