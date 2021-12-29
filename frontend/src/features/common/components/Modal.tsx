import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

type ModalProps = {
  closeHandler: () => void;
};

export const Modal: React.FC<ModalProps> = ({ children, closeHandler }) => {
  const portalElement = useRef<HTMLDivElement>(
    document.querySelector(".portal")!
  );

  useEffect(() => {
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
        closeHandler();
      }
    };

    document.addEventListener("keydown", keydownHandler);

    return () => {
      document.removeEventListener("keydown", keydownHandler);
    };
  }, [closeHandler]);

  return ReactDOM.createPortal(
    <div className="absolute inset-0 bg-black/75 z-10">{children}</div>,
    portalElement.current
  );
};
