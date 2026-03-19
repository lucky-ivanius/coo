# Economics

The bond system is what makes honesty the rational choice. All bonds are denominated in **sBTC (satoshis)** — Bitcoin-native collateral that gives every claim real economic weight.

---

## Bond Rule

The protocol enforces `bond ≥ MIN_BOND_SATS` (10 000 sats) on-chain at `assert()` time. This floor ensures disputes are always economically rational — a disputer knows the minimum they can win is worth the cost of challenging.

The protocol doesn't need everyone to be honest — it only needs one honest disputer. That's a much weaker and more realistic assumption.

---

## Incentive Table

| Scenario | Asserter | Disputer |
|---|---|---|
| Honest claim, no dispute | **bond returned** ✅ | — |
| Honest claim, wrongly disputed → settled | **+disputer's bond** (2× total) ✅ | **−bond** (punished for false challenge) |
| Dishonest claim, no watcher | bond returned (exploit — see Future Work) | — |
| Dishonest claim, caught → rejected | **−bond** (punished) | **+asserter's bond** (2× total) ✅ |
| Disputed, unresolvable → unresolved | **bond returned** (no gain, no loss) | **bond returned** (no gain, no loss) |

The **unresolved** outcome is a safety valve. When an arbiter cannot determine truth, both parties recover their bonds. Neither side is punished for an ambiguous claim.

---

## Bond Flow

```
assert:   asserter → contract    (bond-sats locked)
dispute:  disputer → contract    (matching bond-sats locked)

resolve (settled):    contract → asserter   (2× bond-sats)
resolve (rejected):   contract → disputer   (2× bond-sats)
resolve (unresolved): contract → asserter   (1× bond-sats)
                      contract → disputer   (1× bond-sats)

settle (no dispute):  contract → asserter   (1× bond-sats)
```

---

## Why It Works

The protocol doesn't need *everyone* to be honest — it only needs *one* honest disputer. This is a much weaker and more realistic assumption. Because lying costs the asserter their entire bond, rational actors don't lie. And because the minimum bond floor guarantees a meaningful reward, rational watchers are incentivized to dispute false claims.

---

## Bond Volatility

Bonds are denominated in sats, so their USD value fluctuates with BTC price. This is a known limitation in V1.
