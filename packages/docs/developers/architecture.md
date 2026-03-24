---
description: Data model, ID derivation, and contract internals.
---

# Architecture

Clarity Optimistic Oracle (v1) is a single Clarity contract (`core.clar`) that manages the full assertion lifecycle.

## Data Model

### Assertion Map

Every assertion is stored in `assertion-map`, keyed by a `(buff 32)` assertion ID.

```clarity
{
  asserter:            principal,
  disputer:            (optional principal),
  claim-hash:          (buff 32),
  bond-sats:           uint,
  liveness:            uint,
  status:              uint,
  asserted-at-block:   uint,
  disputed-at-block:   (optional uint),
  settled-at-block:    (optional uint),
  rejected-at-block:   (optional uint),
  unresolved-at-block: (optional uint),
}
```

The full claim is **not** stored on-chain — only its `sha256` hash. The full claim is emitted as a `print` event at assertion time for off-chain indexers.

### Claim Type

Claims are typed as `(buff 2048)` — a raw byte buffer up to 2,048 bytes. This is used instead of `(string-utf8)` because claims may contain arbitrary structured data (JSON, encoded bytes, URLs, hashes) that isn't guaranteed to be valid UTF-8. Consuming protocols define how to interpret the bytes.

### Arbiter Map

A `principal → bool` allowlist. The contract deployer is the initial arbiter. Managed via `add-arbiter` / `remove-arbiter`, restricted to the contract owner.

## Assertion ID

The assertion ID is deterministic:

```
sha256(identifier ++ claim ++ bond-sats ++ liveness ++ asserted-at-block)
```

- **`identifier`** — A `(buff 32)` value defined by the asserter. Use it as a market ID, data feed key, or any meaningful reference to namespace assertions within your protocol.
- **`asserted-at-block`** — Including the block height means the same claim can be re-submitted at a different block and produce a distinct ID. This allows retries after rejection without changing parameters.

`uint` fields are converted to buffers via `to-consensus-buff?` before hashing. Liveness is resolved to its concrete value before derivation so the hash is always deterministic.

## Protocol Parameters

| Parameter | Value | Description |
| --- | --- | --- |
| `DEFAULT_LIVENESS` | 1,440 blocks | ~2 hours at ~5s/block |
| `MIN_LIVENESS` | 1 block | Floor for custom liveness |
| `MIN_BOND_SATS` | 10,000 sats | Minimum sBTC bond |

## sBTC Transfer Patterns

Bond transfers use two Clarity patterns depending on direction:

| Direction | Pattern | Used in |
| --- | --- | --- |
| User → Contract (post bond) | `restrict-assets?` + `with-ft` | `assert`, `dispute` |
| Contract → User (payout) | `contract-call?` with `current-contract` as sender | `settle`, `resolve` |

---

For the full list of functions, events, and error codes, see [Contract Reference](contract-reference.md).
