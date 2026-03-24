---
description: How claims reach their final state.
---

# Settling and Resolving

Claims reach a final state through two paths depending on whether they were disputed.

## Settling (No Dispute)

If the liveness window expires without a dispute, anyone can call `settle` to finalize the assertion. The asserter's bond is returned.

This is the expected path for honest claims — assert, wait, get your bond back.

## Resolving (After Dispute)

When a claim is disputed, an arbiter calls `resolve` with one of three outcomes:

{% tabs %}
{% tab title="Settled" %}
The asserter was right. Asserter receives both bonds.
{% endtab %}

{% tab title="Rejected" %}
The disputer was right. Disputer receives both bonds.
{% endtab %}

{% tab title="Unresolved" %}
The arbiter can't determine truth. Both parties get their own bond back.
{% endtab %}
{% endtabs %}

## Terminal States

{% hint style="info" %}
All three outcomes (`SETTLED`, `REJECTED`, `UNRESOLVED`) are final. Once a claim reaches a terminal state, no further action can be taken on it.
{% endhint %}

For the full breakdown of bond payouts, see [Economics](../overview/economics.md).
