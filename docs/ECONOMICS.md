# Economics

The bond system is what makes honesty the rational choice. All bonds are denominated in **sBTC (satoshis)** — Bitcoin-native collateral that gives every claim real economic weight.

---

## Bond Rule

The protocol enforces `bond ≥ MIN_BOND_SATS` on-chain at `submit()` time. This floor ensures disputes are always economically rational — a disputer knows the minimum they can win is worth the cost of challenging.

The protocol doesn't need everyone to be honest — it only needs one honest disputer. That's a much weaker and more realistic assumption.

---

## Incentive Table

| Scenario | Asserter | Disputer |
|---|---|---|
| Honest claim, no dispute | **bond returned** ✅ | — |
| Honest claim, wrongly disputed | **+disputer's bond** ✅ | **−bond** (punished for false challenge) |
| Dishonest claim, no watcher | bond returned (exploit — see Future Work) | — |
| Dishonest claim, caught | **−bond** (punished) | **+asserter's bond** ✅ |

---

## Bond Volatility

Bonds are denominated in sats, so their USD value fluctuates with BTC price. This is a known limitation in V1.
