import { useReducer } from "react";
import { DisclosureContext } from "./context";
import { disclosureReducer, initialDisclosureState } from "./reducer";

export const Disclosure: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    disclosureReducer,
    initialDisclosureState
  );
  const value = {
    state,
    dispatch,
  };

  return (
    <DisclosureContext.Provider value={value}>
      {children}
    </DisclosureContext.Provider>
  );
};
