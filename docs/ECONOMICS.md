# Economics

The bond system is what makes honesty the rational choice. All bonds and rewards are denominated in **sBTC (satoshis)** — Bitcoin-native collateral that gives every claim real economic weight.

---

## Bond Rule

The protocol requires `bond ≥ 2× reward` (in sats) as a minimum. This makes lying always a net loss when there is at least one honest watcher.

The protocol doesn't need everyone to be honest — it only needs one honest disputer. That's a much weaker and more realistic assumption.

---

## Incentive Table

| Scenario | Asserter | Disputer |
|---|---|---|
| Honest claim, no dispute | **+reward** (bond returned + reward paid) | — |
| Honest claim, wrongly disputed | **+disputer's bond** (extra profit) | **−bond** (punished for lying) |
| Dishonest claim, no watcher | **+reward** (exploit — requires zero watchers) | — |
| Dishonest claim, caught | **−bond** (punished) | **+asserter's bond + reward** |

---

## Bond Volatility

Bonds are denominated in sats, so their USD value fluctuates with BTC price. This is a known limitation in V1.
