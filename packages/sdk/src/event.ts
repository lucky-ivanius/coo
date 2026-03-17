import type { createClient, StacksApiWebSocketClient } from "@stacks/blockchain-api-client";
import type { BufferCV, PrincipalCV, TupleCV, UIntCV } from "@stacks/transactions";
import { Cl } from "@stacks/transactions";

import type { LiteralStringAsciiCV } from "./cv";

export type CooEventTupleCV<TEventName extends string, TData extends TupleCV> = TupleCV<{
  event: LiteralStringAsciiCV<TEventName>;
  data: TData;
}>;

export type CooAssertedEventCV = CooEventTupleCV<
  "asserted",
  TupleCV<{
    "assertion-id": BufferCV;
    "asserted-by": PrincipalCV;
    identifier: BufferCV;
    claim: BufferCV;
    "bond-sats": UIntCV;
    liveness: UIntCV;
    "asserted-at-block": UIntCV;
  }>
>;

export type CooDisputedEventCV = CooEventTupleCV<
  "disputed",
  TupleCV<{
    "assertion-id": BufferCV;
    "disputed-by": PrincipalCV;
    "disputed-at-block": UIntCV;
  }>
>;

export type CooSettledEventCV = CooEventTupleCV<
  "settled",
  TupleCV<{
    "assertion-id": BufferCV;
    "settled-by": PrincipalCV;
    "settled-at-block": UIntCV;
  }>
>;

export type CooRejectedEventCV = CooEventTupleCV<
  "rejected",
  TupleCV<{
    "assertion-id": BufferCV;
    "rejected-by": PrincipalCV;
    "rejected-at-block": UIntCV;
  }>
>;

export type CooUnresolvedEventCV = CooEventTupleCV<
  "unresolved",
  TupleCV<{
    "assertion-id": BufferCV;
    "unresolved-by": PrincipalCV;
    "unresolved-at-block": UIntCV;
  }>
>;

export type CooContractEventCV = CooAssertedEventCV | CooDisputedEventCV | CooSettledEventCV | CooRejectedEventCV | CooUnresolvedEventCV;

export type CooEvent<TEventName extends string, TData> = {
  txId: string;
  event: TEventName;
  data: TData;
};

export type CooAssertedEvent = CooEvent<
  "asserted",
  {
    assertionId: Uint8Array;
    assertedBy: string;
    identifier: Uint8Array;
    claim: Uint8Array;
    bondSats: bigint;
    liveness: bigint;
    assertedAtBlock: bigint;
  }
>;

export type CooDisputedEvent = CooEvent<
  "disputed",
  {
    assertionId: Uint8Array;
    disputedBy: string;
    disputedAtBlock: bigint;
  }
>;

export type CooSettledEvent = CooEvent<
  "settled",
  {
    assertionId: Uint8Array;
    settledBy: string;
    settledAtBlock: bigint;
  }
>;

export type CooRejectedEvent = CooEvent<
  "rejected",
  {
    assertionId: Uint8Array;
    rejectedBy: string;
    rejectedAtBlock: bigint;
  }
>;

export type CooUnresolvedEvent = CooEvent<
  "unresolved",
  {
    assertionId: Uint8Array;
    unresolvedBy: string;
    unresolvedAtBlock: bigint;
  }
>;

export type CooContractEvent = CooAssertedEvent | CooDisputedEvent | CooSettledEvent | CooRejectedEvent | CooUnresolvedEvent;

export const createCooEventSubscriber = (client: ReturnType<typeof createClient>, wsClient: StacksApiWebSocketClient) => {
  return {
    subscribe: async (address: string, onEvent: (event: CooContractEvent) => void) => {
      const txSubscription = await wsClient.subscribeAddressTransactions(address, async ({ tx_id }) => {
        const res = await client.GET("/extended/v1/tx/events", {
          params: {
            query: {
              tx_id,
              type: ["smart_contract_log"],
            },
          },
        });

        res.data?.events.forEach((e) => {
          if (e.event_type !== "smart_contract_log") return;
          if (e.contract_log.contract_id !== address) return;

          const event = Cl.deserialize<CooContractEventCV>(e.contract_log.value.hex);

          switch (event.value.event.value) {
            case "asserted": {
              const {
                value: {
                  data: { value },
                },
              } = event as CooAssertedEventCV;

              const assertionId = Uint8Array.fromHex(value["assertion-id"].value);
              const assertedBy = value["asserted-by"].value;
              const claim = Uint8Array.fromHex(value.claim.value);
              const assertedAtBlock = BigInt(value["asserted-at-block"].value);
              const bondSats = BigInt(value["bond-sats"].value);
              const identifier = Uint8Array.fromHex(value.identifier.value);
              const liveness = BigInt(value.liveness.value);

              onEvent({
                txId: tx_id,
                event: "asserted",
                data: {
                  assertionId,
                  assertedBy,
                  claim,
                  assertedAtBlock,
                  bondSats,
                  identifier,
                  liveness,
                },
              });
              break;
            }

            case "settled": {
              const {
                value: {
                  data: { value },
                },
              } = event as CooSettledEventCV;

              const assertionId = Uint8Array.fromHex(value["assertion-id"].value);
              const settledBy = value["settled-by"].value;
              const settledAtBlock = BigInt(value["settled-at-block"].value);

              onEvent({
                txId: tx_id,
                event: "settled",
                data: {
                  assertionId,
                  settledBy,
                  settledAtBlock,
                },
              });
              break;
            }
            case "disputed": {
              const {
                value: {
                  data: { value },
                },
              } = event as CooDisputedEventCV;

              const assertionId = Uint8Array.fromHex(value["assertion-id"].value);
              const disputedBy = value["disputed-by"].value;
              const disputedAtBlock = BigInt(value["disputed-at-block"].value);

              onEvent({
                txId: tx_id,
                event: "disputed",
                data: {
                  assertionId,
                  disputedBy,
                  disputedAtBlock,
                },
              });
              break;
            }
            case "rejected": {
              const {
                value: {
                  data: { value },
                },
              } = event as CooRejectedEventCV;

              const assertionId = Uint8Array.fromHex(value["assertion-id"].value);
              const rejectedBy = value["rejected-by"].value;
              const rejectedAtBlock = BigInt(value["rejected-at-block"].value);

              onEvent({
                txId: tx_id,
                event: "rejected",
                data: {
                  assertionId,
                  rejectedBy,
                  rejectedAtBlock,
                },
              });
              break;
            }
            case "unresolved": {
              const {
                value: {
                  data: { value },
                },
              } = event as CooUnresolvedEventCV;

              const assertionId = Uint8Array.fromHex(value["assertion-id"].value);
              const unresolvedBy = value["unresolved-by"].value;
              const unresolvedAtBlock = BigInt(value["unresolved-at-block"].value);

              onEvent({
                txId: tx_id,
                event: "unresolved",
                data: {
                  assertionId,
                  unresolvedBy,
                  unresolvedAtBlock,
                },
              });
              break;
            }
            default:
              break;
          }
        });
      });

      return async () => txSubscription.unsubscribe();
    },
  };
};

export type CooEventSubscriber = ReturnType<typeof createCooEventSubscriber>;
