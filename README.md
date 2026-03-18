# Clarity Optimistic Oracle (COO)

Trustless Assertion Layer for the Stacks Ecosystem.

---

## How it works

> **Assume the claim is true. Punish anyone who lies.**

Claims move through a simple state machine:

```
OPEN → SETTLED                                          (happy path, ~99% of cases)
     ↘ DISPUTED → SETTLED / REJECTED / UNRESOLVED
```

Bond economics enforce honesty. Bonds are denominated in **sBTC**. The protocol enforces `bond ≥ MIN_BOND_SATS` (10 000 sats), making lying a net loss as long as one honest disputer is watching.

---

## Contract

`core.clar` owns the full assertion lifecycle — submission, settlement, dispute, and resolution.

| Capability | Description |
|---|---|
| **Assertion Registry** | Stores assertions keyed by a deterministic `assertion-id` derived from `sha256(identifier ++ claim ++ bond-sats ++ liveness ++ asserted-at-block)` |
| **Settlement** | Happy path — after liveness expires with no dispute, anyone can call `settle` to return the bond |
| **Dispute** | Challenge path — a disputer posts a matching bond to flag the assertion |
| **Resolution** | Arbiter path — a whitelisted arbiter resolves disputed assertions as settled, rejected, or unresolved |
| **Arbiter Management** | Contract owner maintains an allowlist of trusted arbiter addresses |

---

## Reading Assertions

Any contract can read an assertion:

```clarity
(contract-call? .coo-core get-assertion assertion-id)
;; => (some { asserter: ST1..., status: u2, bond-sats: u10000, ... })
```

---

## Stack

- **Language** — Clarity (Stacks)
- **Bond token** — sBTC (SIP-010)
- **Liveness default** — 1 440 blocks (~2 hrs, at ~5 s/block)
- **Arbiter model** — Allowlist (contract-owner managed)
- **Network** — Stacks Testnet

---

## Docs

- [Architecture](./docs/ARCHITECTURE.md) — contract layout, claim flow, state machine
- [Economics](./docs/ECONOMICS.md) — bond rule, incentive table, known limitations
- [Roadmap](./docs/ROADMAP.md) — planned features

---

## Status

Under active development. Contracts are not audited. Do not use on mainnet.

---

## License

[MIT](./LICENSE)
