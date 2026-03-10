# Architecture

COO is composed of four contracts. Each has a single, well-defined responsibility.

---

## Contracts

### Core — *The Inbox*

Every interaction starts here. Stores the assertion registry and owns the protocol clock.

- **Assertion Registry** — records who submitted a claim, the hash of the claim, how many sats of sBTC bond they staked, and the liveness window. The full claim is not stored on-chain — only its hash. The full claim is emitted as an event at submission time for off-chain watchers.
- **Block Timer** — uses Stacks block height as the clock. No external timer, no trusted timestamp. Stacks produces fast blocks roughly every 5 seconds (independent of Bitcoin's ~10 min block time), so a liveness of 1440 blocks is roughly 2 hours.

### Settlement — *The Easy Judge*

Handles the happy path, which is almost every case. When the liveness window expires with no dispute, any party can call `settle`. The contract checks the block height, confirms no dispute flag exists, transfers the sBTC bond back to the asserter, and writes the result to the Truth Store.

No governance, no voting, no external calls — just a block check and a token transfer.

### Dispute — *The Hard Judge*

Only activated when someone challenges a claim. The disputer calls `dispute(assertionId)` — no counter-claim is provided. The disputer is simply saying *"this assertion is wrong"* and posting an sBTC bond equal to the asserter's to back that challenge. Both bonds are locked and the claim is flagged as `DISPUTED`. Normal settlement freezes.

**Arbiter Voting** then takes over — a multisig of trusted addresses votes on the correct outcome. Once the threshold is met, two outcomes are possible:

- **Assertion upheld** (asserter was right): asserter receives both bonds. Claim written to Truth Store as TRUE. Terminal state: `SETTLED`.
- **Assertion rejected** (disputer was right): disputer receives both bonds. Nothing written to Truth Store. Terminal state: `REJECTED`.

### Truth Store — *The Memory*

An append-only map of verified results:

```
assertionId → { asserter, settled-at-block, disputed }
```

Only writable by the Settlement and Dispute contracts (on the upheld path). Readable by anyone. Consumers call `get-truth(assertionId)` and receive either a verified entry or nothing — never a false positive. Every entry in the Truth Store is guaranteed to be a verified TRUE claim.

---

## Claim Flow

```
ASSERTED → SETTLED                       (happy path)
         ↘ DISPUTED → SETTLED / REJECTED
```

```mermaid
sequenceDiagram
    participant A as Asserter
    participant OO as COO Contract
    participant D as Disputer
    participant G as Arbiters

    A->>OO: assert(identifier, claim, bond-sats, liveness?)
    Note over OO: assertionId = sha256(identifier ++ claim ++ bond-sats ++ liveness)<br/>claim-hash stored on-chain · full claim emitted as event<br/>liveness = provided value or DEFAULT_LIVENESS<br/>sBTC bond transferred from asserter · Status: ASSERTED

    alt No dispute within liveness window
        A->>OO: settle(assertionId)
        OO-->>A: Transfers sBTC bond back ✅
        Note over OO: Claim written to Truth Store as TRUE<br/>Status: SETTLED (terminal)
    else Disputer disagrees within liveness window
        D->>OO: dispute(assertionId)
        Note over OO: Disputer transfers matching sBTC bond<br/>No counter-claim needed — just a challenge<br/>Both bonds locked · Status: DISPUTED
        G->>OO: resolve(assertionId)
        alt Arbiters uphold the assertion (asserter was right)
            OO-->>A: Asserter gets own bond + disputer bond ✅
            Note over OO: Claim written to Truth Store as TRUE<br/>Status: SETTLED (terminal)
        else Arbiters reject the assertion (disputer was right)
            OO-->>D: Disputer gets own bond + asserter bond ✅
            Note over OO: Assertion invalidated — nothing written to Truth Store<br/>Status: REJECTED (terminal)
        end
    end
```

---

## State Machine

Every `assertionId` moves through exactly these states:

```mermaid
stateDiagram-v2
    [*] --> ASSERTED : asserter submits identifier + claim + sBTC bond\n(assertionId = sha256(identifier ++ claim ++ bond-sats ++ liveness)\nliveness = provided or DEFAULT_LIVENESS)

    ASSERTED --> SETTLED : liveness expires, no dispute raised
    ASSERTED --> DISPUTED : disputer posts matching sBTC bond\n(no counter-claim, just a challenge)

    DISPUTED --> SETTLED : arbiters confirm asserter was right\ntruth written to Truth Store ✅\nasserter wins both bonds
    DISPUTED --> REJECTED : arbiters confirm disputer was right\nassertion invalidated — nothing written\ndisputer wins both bonds

    SETTLED --> [*] : terminal · truth on-chain
    REJECTED --> [*] : terminal · asserter opens new submission to retry
```
