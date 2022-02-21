import { useEffect } from "react";
import { useId } from "features/common/hooks/useId";
import { useCheckWithinTabPanelList, useTab } from "./context";

type TabPanelProps = {
  className: string;
};

export const TabPanel: React.FC<TabPanelProps> = ({ className, children }) => {
  useCheckWithinTabPanelList(TabPanel.name);
  const { state, dispatch } = useTab(TabPanel.name);
  const { selectedTabIndex, panelIds, tabIds } = state;
  const id = useId("tab-panel", 4);
  const isSelected = panelIds[selectedTabIndex] === id;

  useEffect(() => {
    dispatch({ type: "ADD_PANEL_ID", id });
    return () => dispatch({ type: "REMOVE_PANEL_ID", id });
  }, [dispatch, id]);

  return isSelected ? (
    <div
      role="tabpanel"
      className={className}
      tabIndex={0}
      aria-labelledby={tabIds[selectedTabIndex]}
      id={id}
    >
      {children}
    </div>
  ) : null;
};
