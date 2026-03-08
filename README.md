# Clarity Optimistic Oracle (COO)

Trustless Assertion Layer for the Stacks Ecosystem.

---

## How it works

> **Assume the claim is true. Punish anyone who lies.**

Claims move through a simple state machine:

```
REQUESTED → ASSERTED → SETTLED          (happy path, ~99% of cases)
                     ↘ DISPUTED → RESOLVED_TRUE / RESOLVED_FALSE
```

Bond economics enforce honesty. Bonds are denominated in **sBTC**. The protocol requires `bond ≥ 2× reward`, making lying a net loss as long as one honest disputer is watching.

---

## Components

| Name | Role |
|---|---|
| **Core** | Stores requests and assertions, owns the block-height clock |
| **Settlement** | Handles the happy path — checks liveness, releases bonds, writes truth |
| **Dispute** | Activated on challenge — locks bonds, routes arbiter voting, slashes loser |
| **Truth Store** | Append-only map of verified results. Read by any consumer via `get-truth` |

---

## Using the Truth Store

Any contract can read a verified result:

```clarity
(contract-call? .truth-store get-truth statement-id)
;; => (some { result: true, asserter: ST1..., settled-at-block: u12345, disputed: false })
```

---

## Stack

- **Language** — Clarity (Stacks)
- **Bond token** — sBTC (SIP-010)
- **Liveness default** — 144 blocks (~24 hrs)
- **Arbiter model** — Multisig
- **Network** — Stacks Testnet

---

## Docs

- [Architecture](./docs/ARCHITECTURE.md) — contracts, claim flow, state machine
- [Economics](./docs/ECONOMICS.md) — bond rule, incentive table, known limitations

---

## Status

Under active development. Contracts are not audited. Do not use on mainnet.
