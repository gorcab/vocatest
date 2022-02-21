import { TabPanelListContext } from "./context";

export const TabPanelList: React.FC = ({ children }) => {
  return (
    <TabPanelListContext.Provider value={true}>
      {children}
    </TabPanelListContext.Provider>
  );
};
