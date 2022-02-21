import { useCycle } from "framer-motion";
import { FlipCardContext } from "./context/FlipCardContext";

export const FlipProvider: React.FC = ({ children }) => {
  const [isFront, flipCard] = useCycle(true, false);

  const value = {
    isFront,
    flipCard,
  };

  return (
    <FlipCardContext.Provider value={value}>
      {children}
    </FlipCardContext.Provider>
  );
};
