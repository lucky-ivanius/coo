---
description: A permissionless optimistic oracle on Stacks, secured by sBTC bonds.
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# COO

COO (Clarity Optimistic Oracle) is a single Clarity smart contract that gives any protocol on Stacks a trust-minimized way to bring real-world data on-chain.

Any claim can be asserted — a price feed, a bridge event, an insurance condition, a prediction market outcome. Assertions are backed by **sBTC bonds**: post a bond to assert, lose it if you're wrong. One honest disputer is all it takes to keep the system clean.

## How it works

{% stepper %}
{% step %}
## Assert

Anyone submits a claim with an sBTC bond. The full claim is emitted on-chain for watchers; only its hash is stored.
{% endstep %}

{% step %}
## Dispute (optional)

Within the liveness window, any watcher can challenge the claim by posting a matching bond. Both bonds are locked.
{% endstep %}

{% step %}
## Resolve or Settle

No dispute? The asserter's bond is returned after the window expires. Disputed? An arbiter resolves: asserter wins both bonds, disputer wins both bonds, or both get their bond back.
{% endstep %}
{% endstepper %}

## Explore the docs

<table data-view="cards">
    <thead>
        <tr>
            <th>Title</th>
            <th data-card-target data-type="content-ref">Target</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Architecture</td>
            <td><a href="architecture.md">Architecture</a></td>
        </tr>
        <tr>
            <td>Economics</td>
            <td><a href="economics.md">Economics</a></td>
        </tr>
        <tr>
            <td>Roadmap</td>
            <td><a href="roadmap.md">Roadmap</a></td>
        </tr>
    </tbody>
</table>
