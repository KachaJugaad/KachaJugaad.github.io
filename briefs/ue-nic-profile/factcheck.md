# Fact check — "UEC 1.1 points NIC management at a profile nobody has published"

Every factual sentence on the page, with its source. UE = UE Specification 1.1 (UEC, released 12 Oct 2026). Page numbers are the spec's printed page numbers (= PDF page).

| # | Sentence on the page | Source |
|---|---|---|
| 1 | UE Specification 1.1 came out (12 October 2026). | UE 1.1 release notes, p763 |
| 2 | It says NIC management "shall" extend the OCP NIC profile into a UE NIC profile. | UE §7.4, p756 |
| 3 | "UE NIC endpoint manageability shall be prescribed by extending the OCP Ethernet NIC profile." (exact quote) | UE §7.4, p756 |
| 4 | I could not find that profile published. | My search; stated as "could not find", not "does not exist" |
| 5 | "initial focus": link layer and PHY. | UE §7.1, p752 |
| 6 | Table 7-1: 16 tasks, all Mandatory; none for LLR, CBFC or CSIG. | UE Table 7-1, p756 |
| 7 | Switch: Port LLR profile; CBFC virtual channel, credit profile, credit pool; CSIG. | UE §7.6, p759–760 |
| 8 | V1: Server stack Redfish / HTTPS / Redfish model / NC-SI·PLDM·SPDM; switch stack OpenConfig / gNMI / YANG / SAI. | UE §7.2 and Fig 7-1, p752–753 |
| 9 | V1: NIC side "pointer only (7.4)"; switch side "new UE objects (7.6)". | UE §7.4 p756; §7.6 p759–760 |
| 10 | V2: OCP NIC profile v1.0.0 asks for config + firmware. | UE Table 7-1, p756 (lists the OCP profile's tasks) |
| 11 | V2: Port bytes and errors asked; FEC, LLR, CBFC, link-down not asked. PortMetrics covers RX/TX bytes and errors only. | OCP NIC profile v1.0.0, PortMetrics (fact supplied in brief; no page number) |
| 12 | OCP neocloud workstream lists NIC and fabric counters as a gap. | OCP neocloud workstream (fact supplied in brief; no page number) |
| 13 | The BMC path works with the OS down. | UE §7.4, p755 |
| 14 | LLR = resend a damaged frame across one link only. | Brief's definition (consistent with UE §5.1) |
| 15 | CBFC = sender needs buffer credits before sending. | Brief's definition (consistent with UE §5.2) |
| 16 | CSIG = packet tag recording worst congestion on path. | Brief's definition (consistent with UE §4.2) |
| 17 | FEC = error correction built into the link. | **My addition** — a definition, not in the FACTS list; remove if you want zero additions |
| 18 | The switch receives a damaged NIC→switch frame and holds the evidence; on switch→NIC the NIC holds it and the switch knows only that it resent. | Brief's V3 description (link-direction logic; consistent with UE §5.1 LLR being per-link) |
| 19 | Bare-metal GPU tenants own the OS; operators cannot install agents. | Marked "I think" on the page (inference) |
| 20 | OEM fields differ by vendor; every fleet tool needs special cases. | Marked "I have not checked specific vendors" |
| 21 | The switch knows it resent frames, not which part failed. | Brief's constraint (b) |

Not on the page by design: no vendors, customers, numbers, or products. Word count of body text (excluding visuals, captions, sources): 356 (first draft 407; cut 12.5%).
