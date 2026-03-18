"use client";

import { useEffect, useState } from "react";

import type { Assertion } from "@coo/core";

import { AssertionList } from "@/components/verify/assertion-list";
import { AssertionsHeader } from "@/components/verify/assertions-header";
import { useCurrentBlock } from "@/hooks/use-block";
import { useSubscribeAssertionEvent } from "@/hooks/use-subscribe-assertion";
import { useSubscribeBlock } from "@/hooks/use-subscribe-block";

export default function VerifyPage() {
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [assertions, setAssertions] = useState<Assertion[]>([]);

  const { subscribe: subscribeBlock, unsubscribe: unsubscribeBlock, connected: blockSubscriberConnected } = useSubscribeBlock();
  const {
    subscribe: subscribeAssertionEvent,
    unsubscribe: unsubscribeAssertionEvent,
    connected: assertionEventSubscriberConnected,
  } = useSubscribeAssertionEvent();

  const { data: _currentBlock } = useCurrentBlock();

  useEffect(() => {
    if (_currentBlock !== undefined) {
      setCurrentBlock((prev) => Math.max(prev, _currentBlock));
    }
  }, [_currentBlock]);

  useEffect(() => {
    if (!blockSubscriberConnected) return;

    subscribeBlock((nextBlock) => {
      setCurrentBlock((prev) => Math.max(prev, nextBlock));
    });

    return () => {
      unsubscribeBlock();
    };
  }, [blockSubscriberConnected, subscribeBlock, unsubscribeBlock]);

  useEffect(() => {
    if (!assertionEventSubscriberConnected) return;

    subscribeAssertionEvent(({ event, data }) => {
      switch (event) {
        case "asserted": {
          const assertion: Assertion = {
            id: data.assertionId,
            identifier: data.identifier,
            asserter: data.assertedBy,
            claim: data.claim,
            bondSats: data.bondSats,
            liveness: data.liveness,
            status: "open",
            assertedAtBlock: data.assertedAtBlock,
            assertedTxId: data.assertedTxId,
          };

          setAssertions((prev) => (prev.some((a) => a.id === data.assertionId) ? prev : [assertion, ...prev]));

          break;
        }

        case "settled": {
          setAssertions((prev) =>
            prev.map<Assertion>((a) =>
              a.id === data.assertionId
                ? {
                    ...a,
                    status: "settled",
                    settler: data.settledBy,
                    settledAtBlock: data.settledAtBlock,
                    settledTxId: data.settledTxId,
                    ...(a.status === "disputed"
                      ? {
                          resolver: data.settledBy,
                          resolvedAtBlock: data.settledAtBlock,
                          resolvedTxId: data.settledTxId,
                        }
                      : {}),
                  }
                : a
            )
          );

          break;
        }

        case "disputed": {
          setAssertions((prev) =>
            prev.map<Assertion>((a) =>
              a.id === data.assertionId
                ? {
                    ...a,
                    status: "disputed",
                    disputer: data.disputedBy,
                    disputedAtBlock: data.disputedAtBlock,
                    disputedTxId: data.disputedTxId,
                  }
                : a
            )
          );

          break;
        }

        case "rejected": {
          setAssertions((prev) =>
            prev.map<Assertion>((a) =>
              a.id === data.assertionId
                ? {
                    ...a,
                    status: "rejected",
                    resolver: data.rejectedBy,
                    resolvedAtBlock: data.rejectedAtBlock,
                    resolvedTxId: data.rejectedTxId,
                  }
                : a
            )
          );

          break;
        }

        case "unresolved": {
          setAssertions((prev) =>
            prev.map<Assertion>((a) =>
              a.id === data.assertionId
                ? {
                    ...a,
                    status: "unresolved",
                    resolver: data.unresolvedBy,
                    resolvedAtBlock: data.unresolvedAtBlock,
                    resolvedTxId: data.unresolvedTxId,
                  }
                : a
            )
          );

          break;
        }

        default:
          break;
      }
    });

    return () => {
      unsubscribeAssertionEvent();
    };
  }, [assertionEventSubscriberConnected, subscribeAssertionEvent, unsubscribeAssertionEvent]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AssertionsHeader />
      <AssertionList currentBlock={currentBlock} assertions={assertions} />
    </main>
  );
}
