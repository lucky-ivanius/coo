import { useCallback, useRef } from "react";

import type { CooContractEvent } from "@coo/sdk";
import { createCooEventSubscriber } from "@coo/sdk";

import { COO_CORE_CONTRACT } from "@/consts/contracts";

import { useStacksClient } from "./use-stacks-client";

export const useSubscribeAssertionEvent = () => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { client, wsClient } = useStacksClient();

  const subscribe = useCallback(
    async (onEvent: (event: CooContractEvent) => void) => {
      const eventSubscriber = createCooEventSubscriber(client, wsClient);

      const unsubscribe = await eventSubscriber.subscribe(COO_CORE_CONTRACT, onEvent);

      unsubscribeRef.current = unsubscribe;
    },
    [client, wsClient]
  );

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  return {
    connected: (wsClient.webSocket as WebSocket).readyState === WebSocket.OPEN,
    subscribe,
    unsubscribe,
  };
};
