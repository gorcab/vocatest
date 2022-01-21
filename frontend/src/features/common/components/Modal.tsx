import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { visibleVariant } from "../utils/animation-variants";
import { useModal } from "../hooks/useModal";
import React, { MutableRefObject } from "react";
import { FaTimes } from "react-icons/fa";

type ModalProps = {
  onClose: () => void;
  isOpen: boolean;
  title?: string;
  backgroundColorclassName?: string;
  initialFocusRef?: MutableRefObject<HTMLElement | null>;
};

export const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  title,
  onClose,
  backgroundColorclassName,
  initialFocusRef,
}) => {
  const { overlayElement, portalElement } = useModal(
    isOpen,
    onClose,
    initialFocusRef
  );

  const closeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          key="modal"
          variants={visibleVariant}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.1 }}
          ref={overlayElement}
          className="inset-0 bg-black/75 z-[100] fixed"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={`${
              backgroundColorclassName ? `${backgroundColorclassName} ` : ""
            }absolute top-1/2 inset-x-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 md:w-1/3 p-5 z-100 rounded-sm`}
          >
            {title && (
              <>
                <h1 className="font-bold text-lg mb-3">{title}</h1>
                <button
                  onClick={closeHandler}
                  type="button"
                  className="absolute rounded top-2 right-2 hover:text- black/70 focus:outline focus:outline-2 focus:outline-blue-500"
                >
                  <FaTimes className="w-[25px] h-[25px]" />
                  <span className="sr-only">닫기</span>
                </button>
              </>
            )}
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalElement.current
  );
};
