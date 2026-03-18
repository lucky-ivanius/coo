# Roadmap

## Near-term

- [ ] **Callback system** — optional `callback-recipient` per submission — on settlement, COO calls the consumer contract automatically rather than requiring it to poll; enables reactive downstream logic such as insurance payouts and bridge releases
- [ ] Replace arbiter resolve with on-chain token voting using a COO governance token or STX stakers — the full trust model and the default arbitration mechanism
- [ ] **Pluggable escalation managers** — allow per-assertion or per-consumer custom dispute resolution logic via a pluggable interface, mirroring UMA's `escalationManager` pattern; falls back to the default arbiter system when no custom manager is provided
