import { useLayoutEffect, useRef } from "react";
import { Keyboard } from "features/common/utils/constants";
import { TabListContext, useTab } from "./context";

type TabListProps = {
  className?: string;
  onChange?: (selectedIndex: number) => void;
};

export const TabList: React.FC<TabListProps> = ({
  className,
  onChange,
  children,
}) => {
  const { state, dispatch } = useTab(TabList.name);
  const { selectedTabIndex, tabIds } = state;
  const prevTabIndex = useRef<number>(selectedTabIndex);

  useLayoutEffect(() => {
    if (onChange && prevTabIndex.current !== selectedTabIndex) {
      onChange(selectedTabIndex);
    }

    return () => {
      prevTabIndex.current = selectedTabIndex;
    };
  }, [selectedTabIndex, onChange]);

  const onKeyDownHandler: React.KeyboardEventHandler<HTMLDivElement> = (
    event
  ) => {
    switch (event.key) {
      case Keyboard.ArrowRight: {
        event.preventDefault();
        event.stopPropagation();
        const nextTabIdIndex =
          selectedTabIndex < tabIds.length - 1 ? selectedTabIndex + 1 : -1;
        if (nextTabIdIndex === -1) return;
        dispatch({ type: "SELECT_TAB", id: tabIds[nextTabIdIndex] });
        return;
      }
      case Keyboard.ArrowLeft: {
        event.preventDefault();
        event.stopPropagation();
        const prevTabIdIndex = selectedTabIndex - 1;
        if (prevTabIdIndex === -1) return;
        dispatch({ type: "SELECT_TAB", id: tabIds[prevTabIdIndex] });
        return;
      }
      case Keyboard.Home:
      case Keyboard.PageUp: {
        event.preventDefault();
        event.stopPropagation();
        dispatch({ type: "SELECT_TAB", id: tabIds[0] });
        return;
      }
      case Keyboard.End:
      case Keyboard.PageDown: {
        event.preventDefault();
        event.stopPropagation();
        dispatch({ type: "SELECT_TAB", id: tabIds[tabIds.length - 1] });
        return;
      }
    }
  };

  return (
    <div
      onKeyDown={onKeyDownHandler}
      role="tablist"
      className={`flex flex-row${className ? ` ${className}` : ""}`}
    >
      <TabListContext.Provider value={true}>{children}</TabListContext.Provider>
    </div>
  );
};
