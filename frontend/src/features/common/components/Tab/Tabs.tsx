import { useReducer } from "react";
import { TabContext } from "./context";
import { tabInitialState, tabReducer } from "./reducer";

export const Tabs: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(tabReducer, tabInitialState);
  const value = {
    state,
    dispatch,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};
