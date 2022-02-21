import { Keyboard } from "features/common/utils/constants";
import { useDisclosure } from "./context";

type DisclosureButtonProps = {
  className?: string;
};

export const DisclosureButton: React.FC<DisclosureButtonProps> = ({
  className,
  children,
}) => {
  const { state, dispatch } = useDisclosure(DisclosureButton.name);
  const { open, panelId } = state;
  const togglePanel = () => {
    if (open) {
      dispatch({ type: "CLOSE_PANEL" });
    } else {
      dispatch({ type: "OPEN_PANEL" });
    }
  };

  const keyDownHandler: React.KeyboardEventHandler<HTMLButtonElement> = (
    event
  ) => {
    switch (event.key) {
      case Keyboard.Space:
      case Keyboard.Enter: {
        event.preventDefault();
        event.stopPropagation();
        togglePanel();
        return;
      }
    }
  };

  return (
    <button
      className={className}
      aria-expanded={open}
      onClick={togglePanel}
      onKeyDown={keyDownHandler}
      aria-controls={open && panelId ? panelId : undefined}
    >
      {children}
    </button>
  );
};
