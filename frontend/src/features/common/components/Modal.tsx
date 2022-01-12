import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { visibleVariant } from "../utils/animation-variants";
import { useModal } from "../hooks/useModal";
import { MutableRefObject } from "react";
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
          className="absolute inset-0 bg-black/75 z-50"
        >
          <div
            className={`${
              backgroundColorclassName ? `${backgroundColorclassName} ` : ""
            }absolute top-1/2 inset-x-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 md:w-1/3 p-5 z-100 rounded-sm`}
          >
            {title && (
              <>
                <h1 className="font-bold text-lg mb-3">{title}</h1>
                <button
                  onClick={onClose}
                  type="button"
                  className="absolute top-2 right-2 hover:text- black/70"
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
