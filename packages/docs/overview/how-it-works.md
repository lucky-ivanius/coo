---
description: The assert-dispute-settle lifecycle.
---

# How It Works

Every claim follows the same lifecycle: **Assert, Dispute, Settle**.

{% stepper %}
{% step %}
## Assert

Anyone submits a claim with an sBTC bond. The full claim is emitted on-chain as an event for watchers.

The claim enters an **open** state with a liveness window (default: ~2 hours).
{% endstep %}

{% step %}
## Dispute

Within the liveness window, any watcher can challenge the claim by posting a matching sBTC bond. Both bonds are locked and the claim moves to a **disputed** state.

If nobody disputes, skip to the next step.
{% endstep %}

{% step %}
## Settle

**No dispute** — After the liveness window expires, anyone can settle the claim. The asserter's bond is returned.

**Disputed** — An arbiter resolves the dispute with one of three outcomes:

| Outcome | What happens |
| --- | --- |
| Asserter was right | Asserter gets both bonds |
| Disputer was right | Disputer gets both bonds |
| Unclear | Both parties get their own bond back |

All outcomes are terminal. Once settled, rejected, or marked unresolved, the claim is final.
{% endstep %}
{% endstepper %}

## State Flow

```
OPEN → SETTLED                  (no dispute, liveness expired)
     → DISPUTED → SETTLED       (arbiter rules for asserter)
                → REJECTED      (arbiter rules for disputer)
                → UNRESOLVED    (arbiter can't determine truth)
```

For the full bond payouts in each scenario, see [Economics](economics.md).
