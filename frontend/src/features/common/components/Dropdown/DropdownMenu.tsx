import { useDocumentEventHandler } from "features/common/hooks/useDocumentEventHandler";
import { isFocusableElement } from "features/common/utils/helper";
import React, { useReducer, useRef } from "react";
import { dropdownReducer, initialDropdownMenuState } from "./reducer";
import { MenuContext, RefsConext } from "./context";

type DropdownMenuProps<TagType extends React.ElementType> = {
  as?: TagType;
  children: React.ReactNode;
} & React.ComponentProps<TagType>;

export function DropdownMenu<TagType extends React.ElementType>({
  as = "div",
  children,
  ...props
}: DropdownMenuProps<TagType>) {
  const [menuState, dispatch] = useReducer(
    dropdownReducer,
    initialDropdownMenuState
  );
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const itemsRef = useRef<HTMLDivElement | null>(null);
  const { className, ...restProps } = props;
  const defaultClassName = "relative";

  useDocumentEventHandler("mousedown", (event) => {
    const target = event.target as HTMLElement;
    if (!menuState.isOpen) return;
    if (buttonRef.current?.contains(target)) return;
    if (itemsRef.current?.contains(target)) return;
    dispatch({ type: "CLOSE_MENU" });
    if (!isFocusableElement(target)) {
      event.preventDefault();
      event.stopPropagation();
      buttonRef.current?.focus();
    }
  });

  const Component = React.createElement(
    as,
    Object.assign(
      {},
      {
        className: className
          ? `${defaultClassName} ${className}`
          : defaultClassName,
        ...restProps,
      }
    ),
    children
  );

  return (
    <MenuContext.Provider value={[menuState, dispatch]}>
      <RefsConext.Provider value={{ buttonRef, itemsRef }}>
        {Component}
      </RefsConext.Provider>
    </MenuContext.Provider>
  );
}
