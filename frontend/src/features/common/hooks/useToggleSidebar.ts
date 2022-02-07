import { useCallback, useContext } from "react";
import { CloseSidebarContext } from "../components/MainLayout";

export const useCloseSidebar = () => {
  const setShowSidebar = useContext(CloseSidebarContext);

  const closeSidebar = useCallback(() => {
    if (setShowSidebar) {
      setShowSidebar(false);
    }
  }, [setShowSidebar]);

  return closeSidebar;
};
