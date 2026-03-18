import type { createClient, StacksApiWebSocketClient } from "@stacks/blockchain-api-client";
import type { BufferCV, PrincipalCV, TupleCV, UIntCV } from "@stacks/transactions";
import { without0x } from "@stacks/common";
import { Cl } from "@stacks/transactions";

import type { AssertionEvent } from "@coo/core/event";
import { assertedEventSchema, disputedEventSchema, rejectedEventSchema, settledEventSchema, unresolvedEventSchema } from "@coo/core/event";

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

export const createCooEventSubscriber = (client: ReturnType<typeof createClient>, wsClient: StacksApiWebSocketClient) => {
  return {
    subscribe: async (address: string, onEvent: (event: AssertionEvent) => void) => {
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

          const txId = without0x(e.tx_id);

          switch (event.value.event.value) {
            case "asserted": {
              const {
                value: {
                  data: { value },
                },
              } = event as CooAssertedEventCV;

              const assertionId = without0x(value["assertion-id"].value);
              const identifier = without0x(value.identifier.value);
              const claim = without0x(value.claim.value);
              const bondSats = Number.parseInt(value["bond-sats"].value.toString(), 10);
              const liveness = Number.parseInt(value.liveness.value.toString(), 10);
              const assertedBy = value["asserted-by"].value;
              const assertedAtBlock = Number.parseInt(value["asserted-at-block"].value.toString(), 10);

              const eventData = assertedEventSchema.decode({
                event: "asserted",
                data: {
                  assertionId,
                  claim,
                  bondSats,
                  identifier,
                  liveness,
                  assertedBy,
                  assertedAtBlock,
                  assertedTxId: txId,
                },
              });

              onEvent(eventData);
              break;
            }

            case "settled": {
              const {
                value: {
                  data: { value },
                },
              } = event as CooSettledEventCV;

              const assertionId = without0x(value["assertion-id"].value);
              const settledBy = value["settled-by"].value;
              const settledAtBlock = Number.parseInt(value["settled-at-block"].value.toString(), 10);

              const eventData = settledEventSchema.decode({
                event: "settled",
                data: {
                  assertionId,
                  settledBy,
                  settledAtBlock,
                  settledTxId: txId,
                },
              });

              onEvent(eventData);
              break;
            }
            case "disputed": {
              const {
                value: {
                  data: { value },
                },
              } = event as CooDisputedEventCV;

              const assertionId = without0x(value["assertion-id"].value);
              const disputedBy = value["disputed-by"].value;
              const disputedAtBlock = Number.parseInt(value["disputed-at-block"].value.toString(), 10);

              const eventData = disputedEventSchema.decode({
                event: "disputed",
                data: {
                  assertionId,
                  disputedBy,
                  disputedAtBlock,
                  disputedTxId: txId,
                },
              });

              onEvent(eventData);
              break;
            }
            case "rejected": {
              const {
                value: {
                  data: { value },
                },
              } = event as CooRejectedEventCV;

              const assertionId = without0x(value["assertion-id"].value);
              const rejectedBy = value["rejected-by"].value;
              const rejectedAtBlock = Number.parseInt(value["rejected-at-block"].value.toString(), 10);

              const eventData = rejectedEventSchema.decode({
                event: "rejected",
                data: {
                  assertionId,
                  rejectedBy,
                  rejectedAtBlock,
                  rejectedTxId: txId,
                },
              });

              onEvent(eventData);
              break;
            }
            case "unresolved": {
              const {
                value: {
                  data: { value },
                },
              } = event as CooUnresolvedEventCV;

              const assertionId = without0x(value["assertion-id"].value);
              const unresolvedBy = value["unresolved-by"].value;
              const unresolvedAtBlock = Number.parseInt(value["unresolved-at-block"].value.toString(), 10);

              const eventData = unresolvedEventSchema.decode({
                event: "unresolved",
                data: {
                  assertionId,
                  unresolvedBy,
                  unresolvedAtBlock,
                  unresolvedTxId: txId,
                },
              });

              onEvent(eventData);
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
