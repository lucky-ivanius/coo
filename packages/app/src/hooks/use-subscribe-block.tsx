import { useCallback, useRef } from "react";

import { useStacksClient } from "./use-stacks-client";

export type OnBlockUpdateCallback = (currentBlock: number) => void;

export const useSubscribeBlock = () => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { wsClient } = useStacksClient();

  const subscribe = useCallback(
    async (onBlockUpdate: OnBlockUpdateCallback) => {
      const subscription = await wsClient.subscribeBlocks((currentBlock) => {
        onBlockUpdate(currentBlock.height);
      });

      unsubscribeRef.current = subscription.unsubscribe;
    },
    [wsClient]
  );

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  return { connected: (wsClient.webSocket as WebSocket).readyState === WebSocket.OPEN, subscribe, unsubscribe };
};
