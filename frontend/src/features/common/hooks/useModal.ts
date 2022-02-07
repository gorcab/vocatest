import { MutableRefObject, useEffect, useRef } from "react";
import { Keyboard } from "../utils/constants";
import { focusableSelectors } from "../utils/helper";
import { useDocumentEventHandler } from "./useDocumentEventHandler";

export const useModal = (
  isOpen: boolean,
  onClose: () => void,
  initialFocusRef?: MutableRefObject<HTMLElement | null>
) => {
  const overlayElement = useRef<HTMLDivElement>(null);

  useDocumentEventHandler("keydown", (event) => {
    if (event.key === Keyboard.Tab) {
      if (!overlayElement.current) return;
      // focus trap
      const focusableElements =
        overlayElement.current.querySelectorAll(focusableSelectors);
      const firstFocusableElement = focusableElements[0] as HTMLElement;
      const lastFocusableElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement.focus();
        }
      }
    } else if (event.key === Keyboard.Escape) {
      onClose();
    }
  });

  // initial focus
  useEffect(() => {
    if (!isOpen) return;
    if (!overlayElement.current) return;
    if (initialFocusRef) {
      initialFocusRef.current?.focus();
    } else {
      const focusableElements =
        overlayElement.current.querySelectorAll(focusableSelectors);
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [initialFocusRef, isOpen]);

  useEffect(() => {
    if (overlayElement.current === null || !isOpen) {
      return;
    }

    const overlayElem = overlayElement.current;
    const modalCloseHandler = (event: MouseEvent) => {
      if (event.target === overlayElem) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    overlayElem.addEventListener("click", modalCloseHandler);

    return () => {
      overlayElem.removeEventListener("click", modalCloseHandler);
    };
  }, [onClose, isOpen]);

  return { overlayElement };
};
