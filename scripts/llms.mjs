// Writes llms.txt from assets/evidence.js so machine readers get the same sourced facts as the page.  node scripts/llms.mjs
import fs from "node:fs";
globalThis.window = {};
await import(new URL("../assets/evidence.js", import.meta.url));
const E = window.EVIDENCE, P = E.person, SRC = { R: "résumé", R1: "résumé", S: "site", P: "public" };
const site = "https://kachajugaad.github.io/";
const abs = (h) => (/^https?:/.test(h) ? h : site + h);
let o = `# ${P.name}\n\n> ${P.title}. ${P.line}\n\nEvery number below carries its source: résumé, site or public (a page you can open).\n\n## Links\n\n`;
o += P.links.map((l) => `- [${l.label}](${abs(l.href)})`).join("\n") + `\n- [Detailed page: map and timeline](${site}v2/)\n\n## Cases\n`;
for (const u of E.units) {
  o += `\n### ${u.title}\n\n- ${u.org}, ${u.years[0]}${u.years[1] !== u.years[0] ? "–" + u.years[1] : ""}\n`;
  if (u.constraint) o += `- Limit: ${u.constraint}\n`;
  o += `- Problem: ${u.problem}\n- Decision: ${u.decision}\n- Result: ${u.outcome}\n`;
  for (const m of u.metrics || []) o += `- ${m.v} ${m.label} (source: ${SRC[m.conf] || m.conf})\n`;
  for (const p of u.proof || []) o += `- [${p.label}](${abs(p.href)})\n`;
}
o += `\n## Hard calls\n\n` + E.hardCalls.map((c) => `- ${c.tension} Call: ${c.call} Cost: ${c.cost}`).join("\n") + "\n";
o += `\n## Credentials\n\n` + E.credentials.map((c) => `- ${c}`).join("\n") + "\n";
fs.writeFileSync(new URL("../llms.txt", import.meta.url), o);
console.log("llms.txt", o.length, "bytes");
