import { createContext, useContext } from "react";
import { TabAction, TabState } from "../reducer";

export const TabContext =
  createContext<{
    state: TabState;
    dispatch: React.Dispatch<TabAction>;
  } | null>(null);

export function useTab(componentName: string) {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error(`<${componentName} /> must be used within <Tabs />`);
  }
  return context;
}

export const TabListContext = createContext<true | null>(null);

export function useCheckWithinTabList(componentName: string) {
  const context = useContext(TabListContext);
  if (!context) {
    throw new Error(`<${componentName} /> must be used within <TabList />`);
  }
}

export const TabPanelListContext = createContext<true | null>(null);

export function useCheckWithinTabPanelList(componentName: string) {
  const context = useContext(TabPanelListContext);
  if (!context) {
    throw new Error(
      `<${componentName} /> must be used within <TabPanelList />`
    );
  }
}
