import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useId } from "../hooks/useId";

export const Portal: React.FC = ({ children }) => {
  const portalRef = useRef<HTMLDivElement>(document.createElement("div"));
  const id = useId();

  useLayoutEffect(() => {
    if (!portalRef.current) return;
    const elem = portalRef.current;
    elem.id = id;
    document.body.appendChild(elem);
    return () => {
      if (elem.parentElement) {
        elem.parentElement.removeChild(elem);
      }
    };
  }, [id]);

  return createPortal(children, portalRef.current);
};
