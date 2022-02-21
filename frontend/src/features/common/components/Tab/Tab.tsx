import { useEffect, useRef } from "react";
import { useId } from "features/common/hooks/useId";
import { useCheckWithinTabList, useTab } from "./context";

type TabProps = {
  className: string;
  children: JSX.Element | ((isSelected: boolean) => React.ReactNode);
};

export const Tab: React.FC<TabProps> = ({ className, children }) => {
  useCheckWithinTabList(Tab.name);
  const tabRef = useRef<HTMLButtonElement>(null);
  const { state, dispatch } = useTab(Tab.name);
  const { tabIds, selectedTabIndex } = state;
  const tabId = useId("tab-button", 4);
  const isSelected = tabIds[selectedTabIndex] === tabId;

  useEffect(() => {
    dispatch({ type: "ADD_TAB_ID", id: tabId });
    return () => dispatch({ type: "REMOVE_TAB_ID", id: tabId });
  }, [dispatch, tabId]);

  useEffect(() => {
    if (!tabRef.current) return;
    if (isSelected) {
      tabRef.current.focus();
    }
  }, [isSelected]);

  const clickTab: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch({ type: "SELECT_TAB", id: tabId });
  };

  return (
    <button
      ref={tabRef}
      className={className}
      onClick={clickTab}
      role="tab"
      type="button"
      id={tabId}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
    >
      {typeof children === "function" ? children(isSelected) : children}
    </button>
  );
};
