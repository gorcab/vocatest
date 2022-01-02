import ReactDOM from "react-dom";
import { useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { selectToasts } from "../slice";
import { Toast } from "./Toast";

export const ToastContainer: React.FC = () => {
  const toasts = useSelector(selectToasts);

  return ReactDOM.createPortal(
    <ul className="fixed z-[9999] top-2 left-1/2 -translate-x-1/2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            layout
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            {...toast}
          />
        ))}
      </AnimatePresence>
    </ul>,
    document.querySelector(".portal")!
  );
};
