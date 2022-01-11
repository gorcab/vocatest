import React, {
  EventHandler,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type DropdownContextProps = {
  isOpen: boolean;
  id: number | string;
  toggleHandler: EventHandler<any>;
  dropdownToggleButtonRef: MutableRefObject<HTMLButtonElement | null>;
};

export const DropdownContext =
  React.createContext<DropdownContextProps | null>(null);

type DropdownProps = {
  id: number | string;
};

export const Dropdown: React.FC<DropdownProps> = ({ id, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownToggleButtonRef = useRef<HTMLButtonElement | null>(null);

  const toggleHandler = useCallback((event) => {
    event.preventDefault();
    setIsOpen((prev) => !prev);
  }, []);

  const outsideClickHandler: EventHandler<any> = useCallback(
    (event) => {
      if (
        dropdownToggleButtonRef.current &&
        !dropdownToggleButtonRef.current.contains(event.target as Node)
      ) {
        event.preventDefault();
        if (isOpen) {
          setIsOpen(false);
        }
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", outsideClickHandler);
      return () => {
        document.addEventListener("click", outsideClickHandler);
      };
    }
  }, [outsideClickHandler, isOpen]);

  return (
    <DropdownContext.Provider
      value={{
        id,
        isOpen,
        toggleHandler,
        dropdownToggleButtonRef,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};
