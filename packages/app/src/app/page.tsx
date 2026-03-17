"use client";

import { useEffect, useState } from "react";

import type { Assertion } from "@/types/assertion";
import { AssertionList } from "@/components/verify/assertion-list";
import { AssertionsHeader } from "@/components/verify/assertions-header";
import { useCurrentBlock } from "@/hooks/use-block";
import { useSubscribeAssertionEvent } from "@/hooks/use-subscribe-assertion";
import { useSubscribeBlock } from "@/hooks/use-subscribe-block";
import { bytesToHex, bytesToText } from "@/lib/assertion";
import { ASSERTION_STATUS } from "@/types/assertion";

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

    subscribeAssertionEvent(({ txId, event, data }) => {
      const assertionId = bytesToHex(data.assertionId);

      switch (event) {
        case "asserted": {
          const assertion: Assertion = {
            id: assertionId,
            identifier: bytesToText(data.identifier),
            asserter: data.assertedBy,
            claim: bytesToText(data.claim),
            bondSats: Number(data.bondSats),
            liveness: Number(data.liveness),
            status: ASSERTION_STATUS.OPEN,
            assertedTxId: txId,
            assertedAtBlock: Number(data.assertedAtBlock),
          };

          setAssertions((prev) => (prev.some((a) => a.id === assertionId) ? prev : [assertion, ...prev]));

          break;
        }

        case "settled": {
          setAssertions((prev) =>
            prev.map((a) =>
              a.id === assertionId
                ? {
                    ...a,
                    status: ASSERTION_STATUS.SETTLED,
                    resolver: a.status === ASSERTION_STATUS.DISPUTED ? data.settledBy : undefined,
                    settler: data.settledBy,
                    settledTxId: txId,
                    settledAtBlock: Number(data.settledAtBlock),
                  }
                : a
            )
          );

          break;
        }

        case "disputed": {
          setAssertions((prev) =>
            prev.map((a) =>
              a.id === assertionId
                ? { ...a, status: ASSERTION_STATUS.DISPUTED, disputedTxId: txId, disputedAtBlock: Number(data.disputedAtBlock), disputer: data.disputedBy }
                : a
            )
          );

          break;
        }

        case "rejected": {
          setAssertions((prev) =>
            prev.map((a) =>
              a.id === assertionId
                ? {
                    ...a,
                    status: ASSERTION_STATUS.REJECTED,
                    resolver: data.rejectedBy,
                    rejectedTxId: txId,
                    rejectedAtBlock: Number(data.rejectedAtBlock),
                    rejectedBy: data.rejectedBy,
                  }
                : a
            )
          );

          break;
        }

        case "unresolved": {
          setAssertions((prev) =>
            prev.map((a) =>
              a.id === assertionId
                ? {
                    ...a,
                    status: ASSERTION_STATUS.UNRESOLVED,
                    resolver: data.unresolvedBy,
                    unresolvedTxId: txId,
                    unresolvedAtBlock: Number(data.unresolvedAtBlock),
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
