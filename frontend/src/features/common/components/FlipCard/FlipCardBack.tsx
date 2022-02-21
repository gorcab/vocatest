import { motion } from "framer-motion";
import { useRef } from "react";
import { useFlipCard } from "./context/FlipCardContext";

const flipVariants = {
  mount: {
    opacity: 0,
    rotateY: 180,
  },
  flipToBack: {
    rotateY: 360,
    opacity: 1,
  },
  initial: {
    opacity: 0,
    rotateY: 180,
  },
};

export const FlipCardBack: React.FC = ({ children }) => {
  const { isFront } = useFlipCard(FlipCardBack.name);
  const divRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef<boolean>(false);

  return (
    <motion.div
      ref={divRef}
      style={{
        backfaceVisibility: "hidden",
      }}
      onAnimationStart={() => {
        if (divRef.current) {
          if (!isMounted.current) {
            isMounted.current = true;
            divRef.current.style.visibility = "hidden";
          }
          if (!isFront) {
            divRef.current.style.visibility = "visible";
          }
        }
      }}
      onAnimationComplete={() => {
        if (divRef.current && isFront) {
          divRef.current.style.visibility = "hidden";
        }
      }}
      initial={"mount"}
      animate={isFront ? "initial" : "flipToBack"}
      variants={flipVariants}
      className="w-full h-full absolute"
    >
      {children}
    </motion.div>
  );
};
