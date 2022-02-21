import { motion } from "framer-motion";
import { useRef } from "react";
import { useFlipCard } from "./context/FlipCardContext";

const flipVariants = {
  flipToBack: {
    rotateY: 180,
    opacity: 0,
  },
  initial: {
    opacity: 1,
    rotateY: 0,
  },
};

export const FlipCardFront: React.FC = ({ children }) => {
  const { isFront } = useFlipCard(FlipCardFront.name);
  const divRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      style={{
        backfaceVisibility: "hidden",
      }}
      ref={divRef}
      initial={"initial"}
      animate={isFront ? "initial" : "flipToBack"}
      onAnimationStart={() => {
        if (divRef.current && isFront) {
          divRef.current.style.visibility = "visible";
        }
      }}
      onAnimationComplete={() => {
        if (divRef.current && !isFront) {
          divRef.current.style.visibility = "hidden";
        }
      }}
      variants={flipVariants}
      className="w-full h-full absolute"
    >
      {children}
    </motion.div>
  );
};
