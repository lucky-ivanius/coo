---
description: Frequently asked questions about Clarity Optimistic Oracle.
---

# FAQs

<details>
<summary>What is an optimistic oracle?</summary>

An optimistic oracle assumes every claim is true by default. Instead of verifying upfront, the system accepts claims and gives anyone the chance to dispute. If a claim is false, the liar loses real money.
</details>

<details>
<summary>Why sBTC?</summary>

All bonds are denominated in sBTC — Bitcoin-native collateral on Stacks. This gives every claim real economic weight backed by BTC.
</details>

<details>
<summary>What happens if nobody disputes a claim?</summary>

The claim becomes accepted truth after the liveness window expires. The asserter gets their bond back. See [How It Works](overview/how-it-works.md).
</details>

<details>
<summary>What happens if someone disputes?</summary>

Both the asserter and disputer have bonds locked. An arbiter reviews the dispute and decides who was right. The winner takes both bonds. If the outcome is unclear, both parties get their bonds back. See [Economics](overview/economics.md) for the full payout breakdown.
</details>

<details>
<summary>Can anyone be an arbiter?</summary>

Currently, arbiters are managed through an allowlist controlled by the contract owner. The [Roadmap](overview/roadmap.md) includes plans for decentralized resolution through token-weighted voting.
</details>

<details>
<summary>What's the minimum bond?</summary>

10,000 sats ≈ 0.0001 sBTC. This floor ensures disputes are always economically worthwhile.
</details>

<details>
<summary>How long is the dispute window?</summary>

The default liveness window is 1,440 blocks (~2 hours at ~5 seconds per block). Asserters can set a custom window, with a minimum of 1 block.
</details>

<details>
<summary>Can I use this in my protocol?</summary>

Yes. Clarity Optimistic Oracle is designed as infrastructure — any contract on Stacks can call into it. See [Integration](developers/integration.md).
</details>
