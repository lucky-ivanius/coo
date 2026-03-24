---
description: How to submit a claim backed by an sBTC bond.
---

# Asserting Claims

To assert a claim, call `assert` with:

- **`identifier`** — A `(buff 32)` value that namespaces your claim (e.g., a market ID or request ID)
- **`claim`** — The claim data as `(buff 2048)`. Emitted on-chain for watchers.
- **`bond-sats`** — sBTC bond amount in satoshis. Minimum: 10,000 sats.
- **`liveness`** — Optional. Custom dispute window in blocks. Defaults to 1,440 blocks (~2 hours).

The contract transfers your sBTC bond, stores the claim hash, and emits the full claim as an event.

Your assertion enters the **open** state. From here:

- **No dispute** — After the liveness window expires, anyone can call `settle` to return your bond. See [Settling and Resolving](settling.md).
- **Disputed** — A disputer posts a matching bond and the claim moves to **disputed**. See [Disputing Claims](disputing.md).

## What Makes a Good Claim

Claims should be specific and verifiable. Include enough detail that any third party can independently determine if the claim is true or false.

{% hint style="success" %}
Good: `"BTC/USD was below $55,000 at 00:00 UTC on March 15, 2024 per Coinbase Pro OHLCV"`
{% endhint %}

{% hint style="danger" %}
Bad: `"BTC price was low in March 2024"`
{% endhint %}
