import { useEffect, useRef } from "react";

export const useModal = (isOpen: boolean, onClose: () => void) => {
  const portalElement = useRef<HTMLDivElement>(
    document.querySelector(".portal")!
  );
  const overlayElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // focus trap
    const keydownHandler = (event: KeyboardEvent) => {
      if (portalElement.current === null) return;
      if (event.key === "Tab") {
        const focusableElements = portalElement.current.querySelectorAll(
          "a, button:not([disabled]), textarea, input:not([disabled]), select"
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      } else if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", keydownHandler);

    return () => {
      document.removeEventListener("keydown", keydownHandler);
    };
  }, [onClose, isOpen]);

  useEffect(() => {
    if (portalElement.current === null || overlayElement.current === null) {
      return;
    }
    if (isOpen) {
      const overlayElem = overlayElement.current;
      const modalCloseHandler = (event: MouseEvent) => {
        if (event.target === overlayElem) {
          onClose();
        }
      };

      overlayElem.addEventListener("click", modalCloseHandler);

      return () => {
        overlayElem.removeEventListener("click", modalCloseHandler);
      };
    }
  }, [onClose, isOpen]);

  return { overlayElement, portalElement };
};
