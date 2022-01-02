import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { visibleVariant } from "../utils/animation-variants";
import { useModal } from "../hooks/useModal";

type ModalProps = {
  onClose: () => void;
  isOpen: boolean;
};

export const Modal: React.FC<ModalProps> = ({ children, isOpen, onClose }) => {
  const { overlayElement, portalElement } = useModal(isOpen, onClose);

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
          className="absolute inset-0 bg-black/75 z-10"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    portalElement.current
  );
};
