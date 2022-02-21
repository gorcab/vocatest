import { useId } from "features/common/hooks/useId";
import { useEffect } from "react";
import { useDisclosure } from "./context";

type DisclosurePanelProps = {
  className?: string;
};

export const DisclosurePanel: React.FC<DisclosurePanelProps> = ({
  className,
  children,
}) => {
  const {
    state: { open },
    dispatch,
  } = useDisclosure(DisclosurePanel.name);
  const id = useId("disclosure-panel", 2);

  useEffect(() => {
    dispatch({ type: "REGISTER_PANEL_ID", id });
    return () => dispatch({ type: "UNREGISTER_PANEL_ID" });
  }, [id, dispatch]);

  return open ? (
    <div className={className} id={id}>
      {children}
    </div>
  ) : null;
};
