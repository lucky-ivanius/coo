# Roadmap

## Near-term

- [ ] Replace multisig arbiters with on-chain token voting using a COO governance token or STX stakers — the full UMA-equivalent trust model and the default arbitration mechanism
- [ ] **Pluggable escalation managers (V2)** — allow per-assertion or per-consumer custom dispute resolution logic via a pluggable interface, mirroring UMA's `escalationManager` pattern; falls back to the default token-vote arbiter system when no custom manager is provided
- [ ] **Callback system (V2)** — optional `callback-recipient` per submission — on settlement, COO calls the consumer contract automatically rather than requiring it to poll `get-truth`; enables reactive downstream logic such as insurance payouts and bridge releases

## Medium-term

- [ ] **Data type registry** — allow asserters to tag submissions with a type (price, event, fill-proof) so consumers can query by category, not just by `assertionId`

## Long-term

- [ ] Explore ZK-proof integration as an alternative dispute resolution path — instead of arbiter voting, a disputer could submit a cryptographic proof of the source-chain state, making resolution trustless and near-instant
