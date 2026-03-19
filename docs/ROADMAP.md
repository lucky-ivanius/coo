# Roadmap

## Intentionally Out of Scope (Hackathon)

These are not oversights — they are honest scope decisions made to ship a working protocol in a hackathon timeframe.

| Skipped for now | Why |
|---|---|
| Separate Truth Store contract | Single contract is simpler; consumers read directly via `get-assertion` |
| Token-based arbiter voting (like UMA's DVM) | Requires a governance token, distribution, and commit-reveal voting — weeks of work |
| Multiple dispute rounds / escalation tiers | Single-round arbiter resolution is sufficient for V1 security model |
| Fee treasury / protocol revenue | Adds token economics complexity; out of scope for infra demo |
| Watcher bot / keeper network | Off-chain component; described in docs but not built |
| Multi-contract architecture | All logic fits cleanly in one contract for V1; can be split later if needed |

---

## Near-term (Post-Hackathon)

- [ ] **On-chain token voting** — replace arbiter resolution with on-chain token voting using a COO governance token or STX stakers — the full UMA-equivalent trust model and the default arbitration mechanism
- [ ] **Pluggable escalation managers** — allow per-assertion or per-consumer custom dispute resolution logic via a pluggable interface/traits; when no custom manager is provided, falls back to the default token-vote arbiter system
- [ ] **Callback system** — optional `callback-recipient` per submission — on settlement, COO calls the consumer contract automatically rather than requiring it to poll `get-assertion`; enables reactive downstream logic such as insurance payouts and bridge releases
