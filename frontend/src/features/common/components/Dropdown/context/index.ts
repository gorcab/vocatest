import { createContext, MutableRefObject, useContext } from "react";
import { DropdownMenuState, DropdownAction } from "../reducer";

export const MenuContext =
  createContext<[DropdownMenuState, React.Dispatch<DropdownAction>] | null>(
    null
  );

export function useMenuContext(componentName: string) {
  const menuContext = useContext(MenuContext);
  if (!menuContext) {
    throw new TypeError(
      `<${componentName}> must be within <DropdownMenu> component.`
    );
  }
  return menuContext;
}

export const RefsConext =
  createContext<{
    buttonRef: MutableRefObject<HTMLButtonElement | null>;
    itemsRef: MutableRefObject<HTMLDivElement | null>;
  } | null>(null);

export function useRefsContext(componentName: string) {
  const refsContext = useContext(RefsConext);
  if (!refsContext) {
    throw new TypeError(
      `<${componentName}> must be within <DropdownMenu> component.`
    );
  }
  return refsContext;
}
