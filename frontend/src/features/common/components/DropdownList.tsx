import { AnimatePresence, motion } from "framer-motion";
import { useDropdown } from "../hooks/useDropdown";
import { visibleVariant } from "../utils/animation-variants";

export const DropdownList: React.FC = ({ children }) => {
  const { isOpen, id } = useDropdown();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.ul
          key={id}
          id={`menu-${id}`}
          role="menu"
          variants={visibleVariant}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="absolute top-[110%] w-24 rounded-sm border right-0 flex flex-col"
        >
          {children}
        </motion.ul>
      )}
    </AnimatePresence>
  );
};
