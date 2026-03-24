---
description: How sBTC bonds make honesty the rational choice.
---

# Economics

All bonds are denominated in sBTC (satoshis) — Bitcoin-native collateral that gives every claim real economic weight.

## Bond Rules

- Minimum bond: **10,000 sats** (enforced on-chain at assertion time)
- Disputers must post a **matching** bond
- Bonds are locked until the claim reaches a terminal state

{% hint style="info" %}
The minimum floor ensures disputes are always economically rational — a disputer knows the minimum reward is worth the cost of challenging.
{% endhint %}

## Outcomes

| Scenario | Asserter | Disputer |
| --- | --- | --- |
| Honest claim, no dispute | Bond returned | — |
| Honest claim, wrongly disputed | Gets both bonds (2x) | Loses bond |
| Dishonest claim, caught | Loses bond | Gets both bonds (2x) |
| Disputed, unclear outcome | Bond returned | Bond returned |

The **unclear** outcome is a safety valve. When an arbiter cannot determine truth, both parties recover their bonds. Neither side is punished for an ambiguous claim.

## Bond Flow

```
Assert:     asserter → contract    (bond locked)
Dispute:    disputer → contract    (matching bond locked)

Settled:    contract → asserter    (2x bond)
Rejected:   contract → disputer    (2x bond)
Unresolved: contract → asserter    (1x bond)
            contract → disputer    (1x bond)

No dispute: contract → asserter    (1x bond returned)
```

## Why It Works

The protocol doesn't need everyone to be honest. It needs **one** honest watcher to catch a lie. Lying costs the asserter their entire bond. The minimum bond floor guarantees a meaningful reward for watchers. Rational actors don't lie, and rational watchers dispute false claims.

## Known Limitations

{% hint style="warning" %}
Bonds are denominated in sats, so their USD value fluctuates with BTC price. This is a known trade-off in the current version.
{% endhint %}
