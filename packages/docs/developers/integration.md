---
description: How to use Clarity Optimistic Oracle in your protocol.
---

# Integration

Clarity Optimistic Oracle is designed to be called from other Clarity contracts. Any protocol on Stacks can use it as a source of truth.

## Basic Flow

Your contract calls into the oracle contract to:

{% stepper %}
{% step %}
## Submit assertions

Call `assert` with an identifier, claim, bond amount, and optional liveness window.
{% endstep %}

{% step %}
## Check results

Call `get-assertion` to read the current status of any assertion by its ID.
{% endstep %}

{% step %}
## React to outcomes

Use the assertion status to trigger downstream logic in your protocol (payouts, state changes, etc.).
{% endstep %}
{% endstepper %}

## Identifier

The `identifier` field (`buff 32`) is yours to define. Use it to namespace assertions within your protocol — a market ID, a data feed key, a request ID, or any meaningful reference.

## Claim Format

Claims are `(buff 2048)`. Your protocol defines the encoding and interpretation. Common approaches:

- UTF-8 encoded human-readable strings
- JSON-encoded structured data
- Application-specific binary formats

{% hint style="info" %}
Off-chain watchers read the emitted `claim` from the `asserted` event and interpret it per your protocol's specification.
{% endhint %}
