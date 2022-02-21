import { createContext, useContext } from "react";
import { useCycle } from "framer-motion";

type FlipCardContextType = {
  isFront: boolean;
  flipCard: ReturnType<typeof useCycle>[1];
};

export const FlipCardContext = createContext<FlipCardContextType | null>(null);

export function useFlipCard(componentName: string) {
  const context = useContext(FlipCardContext);
  if (!context) {
    throw new Error(
      `<${componentName} /> Component must be used within <FlipCard />.`
    );
  }

  return context;
}
