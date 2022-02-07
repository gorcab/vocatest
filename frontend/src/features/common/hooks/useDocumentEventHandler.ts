import { useEffect, useRef } from "react";

type Listener<EventType extends keyof DocumentEventMap> = (
  this: Document,
  event: DocumentEventMap[EventType]
) => any;

export const useDocumentEventHandler = <
  EventType extends keyof DocumentEventMap
>(
  eventType: EventType,
  listener: Listener<EventType>,
  options?: boolean | AddEventListenerOptions
) => {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;
  useEffect(() => {
    function handler(event: DocumentEventMap[EventType]) {
      listenerRef.current.call(document, event);
    }

    document.addEventListener(eventType, handler, options);
    return () => document.removeEventListener(eventType, handler, options);
  }, [eventType, options]);
};
