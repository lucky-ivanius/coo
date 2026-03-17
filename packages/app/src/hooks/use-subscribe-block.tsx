import { useCallback, useRef } from "react";

import { useStacksClient } from "./use-stacks-client";

export type OnBlockUpdateCallback = (currentBlock: number) => void;

export const useSubscribeBlock = () => {
  const unsubscribeRef = useRef<(() => Promise<void>) | null>(null);
  const { wsClient } = useStacksClient();

  const subscribe = useCallback(
    async (onBlockUpdate: OnBlockUpdateCallback) => {
      if (unsubscribeRef.current) await unsubscribeRef.current();

      const subscription = await wsClient.subscribeBlocks((currentBlock) => {
        onBlockUpdate(currentBlock.height);
      });

      unsubscribeRef.current = subscription.unsubscribe;
    },
    [wsClient]
  );

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current().then(() => {
        unsubscribeRef.current = null;
      });
    }
  }, []);

  return { connected: (wsClient.webSocket as WebSocket).readyState === WebSocket.OPEN, subscribe, unsubscribe };
};
