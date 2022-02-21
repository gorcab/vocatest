import { createContext, useContext } from "react";
import { DisclosureState, DisclosureAction } from "../reducer";

export const DisclosureContext =
  createContext<{
    state: DisclosureState;
    dispatch: React.Dispatch<DisclosureAction>;
  } | null>(null);

export function useDisclosure(componentName: string) {
  const context = useContext(DisclosureContext);
  if (!context) {
    throw new Error(`<${componentName} /> must be used within <Disclosure />`);
  }
  return context;
}
