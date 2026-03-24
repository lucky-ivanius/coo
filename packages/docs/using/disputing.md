---
description: How to challenge a claim you believe is false.
---

# Disputing Claims

If you believe an assertion is false, call `dispute` with the assertion ID.

You must post a matching sBTC bond — the same amount the asserter staked.

## Requirements

- The assertion must be in the **open** state
- The liveness window must still be active
- You must have enough sBTC to match the bond

## What Happens Next

Both bonds (yours and the asserter's) are locked. The assertion moves to the **disputed** state.

An arbiter will review and resolve the dispute:

| Outcome | You (disputer) | Asserter |
| --- | --- | --- |
| You were right | Get both bonds | Loses bond |
| Asserter was right | Lose bond | Gets both bonds |
| Unclear | Bond returned | Bond returned |

See [Settling and Resolving](settling.md) for how resolution works.

## When to Dispute

{% hint style="warning" %}
Only dispute claims you can prove are false. Disputing a true claim costs you your entire bond. The [economics](../overview/economics.md) are designed so that honest behavior is always the rational choice.
{% endhint %}
