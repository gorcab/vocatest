import React, {
  createContext,
  MutableRefObject,
  useContext,
  useReducer,
  useRef,
} from "react";
import { useDocumentEventHandler } from "../../category/hooks/useDocumentEventHandler";
import { isFocusableElement } from "../utils/helper";

type ItemState = {
  id: string;
  focus: boolean;
  click: boolean;
};

type DropdownMenuState = {
  isOpen: boolean;
  buttonId: string | null;
  itemListId: string | null;
  items: ItemState[];
  activeItemIndex: number | null;
};

const getInitialItemState = (id: string): ItemState => ({
  id,
  focus: false,
  click: false,
});

const initialDropdownMenuState: DropdownMenuState = {
  isOpen: false,
  buttonId: null,
  itemListId: null,
  items: [],
  activeItemIndex: null,
};

type FocusType =
  | "FOCUS_FIRST"
  | "FOCUS_NEXT"
  | "FOCUS_PREV"
  | "FOCUS_LAST"
  | "UNFOCUS";

type Action =
  | { type: "OPEN_MENU" }
  | { type: "REGISTER_BUTTON"; id: string }
  | { type: "REGISTER_ITEM_LIST"; id: string }
  | { type: "REGISTER_ITEM"; id: string }
  | { type: "CLICK_ACTIVE_ITEM" }
  | { type: "FOCUS"; focusType: FocusType }
  | { type: "FOCUS_ITEM"; id: string }
  | { type: "UNREGISTER_ITEM"; id: string }
  | { type: "CLOSE_MENU" };

function reducer(state: DropdownMenuState, action: Action): DropdownMenuState {
  switch (action.type) {
    case "OPEN_MENU": {
      return { ...state, isOpen: true };
    }
    case "REGISTER_BUTTON": {
      return { ...state, buttonId: action.id };
    }
    case "REGISTER_ITEM_LIST": {
      return { ...state, itemListId: action.id };
    }
    case "REGISTER_ITEM": {
      const item = getInitialItemState(action.id);
      const items = state.items.concat(item);
      return {
        ...state,
        items,
      };
    }
    case "CLICK_ACTIVE_ITEM": {
      const items = state.items.map((item, index) => {
        if (index === state.activeItemIndex) {
          return { ...item, focus: false, click: true };
        }
        return { ...item };
      });
      return {
        ...state,
        items,
      };
    }
    case "FOCUS": {
      const items = state.items.map((item) => getInitialItemState(item.id));
      const newState = { ...state, items };
      if (items.length > 0) {
        switch (action.focusType) {
          case "FOCUS_FIRST": {
            items[0] = { ...items[0], focus: true };
            newState.activeItemIndex = 0;
            break;
          }
          case "FOCUS_NEXT": {
            if (newState.activeItemIndex !== null) {
              if (newState.activeItemIndex < newState.items.length - 1) {
                newState.activeItemIndex = newState.activeItemIndex + 1;
              } else {
                newState.activeItemIndex = 0;
              }
              items[newState.activeItemIndex] = {
                ...items[newState.activeItemIndex],
                focus: true,
              };
            } else {
              items[0] = { ...items[0], focus: true };
              newState.activeItemIndex = 0;
            }
            break;
          }
          case "FOCUS_PREV": {
            if (newState.activeItemIndex !== null) {
              if (newState.activeItemIndex === 0) {
                newState.activeItemIndex = items.length - 1;
              } else {
                newState.activeItemIndex -= 1;
              }
              items[newState.activeItemIndex] = {
                ...items[newState.activeItemIndex],
                focus: true,
              };
            } else {
              items[items.length - 1] = {
                ...items[items.length - 1],
                focus: true,
              };
              newState.activeItemIndex = items.length - 1;
            }

            break;
          }
          case "FOCUS_LAST": {
            items[items.length - 1] = {
              ...items[items.length - 1],
              focus: true,
            };
            newState.activeItemIndex = items.length - 1;
            break;
          }
          case "UNFOCUS": {
            return {
              ...newState,
              activeItemIndex: null,
            };
          }
        }
      }
      return {
        ...newState,
      };
    }
    case "FOCUS_ITEM": {
      const items = state.items.map((item) => getInitialItemState(item.id));
      let activeItemIndex = null;
      if (items.length > 0) {
        activeItemIndex = items.findIndex((item) => item.id === action.id);
        if (activeItemIndex !== -1) {
          items[activeItemIndex] = { ...items[activeItemIndex], focus: true };
        } else {
          activeItemIndex = null;
        }
      }
      return {
        ...state,
        items,
        activeItemIndex,
      };
    }
    case "CLOSE_MENU": {
      return { ...initialDropdownMenuState };
    }
    case "UNREGISTER_ITEM": {
      const items = state.items.slice();
      const activeItem =
        state.activeItemIndex !== null
          ? state.items[state.activeItemIndex]
          : null;
      const unregisteredItemIndex = items.findIndex(
        (item) => item.id === action.id
      );
      if (unregisteredItemIndex !== -1) {
        items.splice(unregisteredItemIndex, 1);
      }

      return {
        ...state,
        items,
        activeItemIndex: (() => {
          if (unregisteredItemIndex === state.activeItemIndex) return null;
          if (activeItem === null) return null;
          return items.indexOf(activeItem);
        })(),
      };
    }
  }
}

const MenuContext =
  createContext<[DropdownMenuState, React.Dispatch<Action>] | null>(null);

export function useMenuContext(componentName: string) {
  const menuContext = useContext(MenuContext);
  if (!menuContext) {
    throw new Error(
      `<${componentName}> must be within <DropdownMenu> component.`
    );
  }
  return menuContext;
}

const RefsConext =
  createContext<{
    buttonRef: MutableRefObject<HTMLButtonElement | null>;
    itemsRef: MutableRefObject<HTMLDivElement | null>;
  } | null>(null);

export function useRefsContext(componentName: string) {
  const refsContext = useContext(RefsConext);
  if (!refsContext) {
    throw new Error(
      `<${componentName}> must be within <DropdownMenu> component.`
    );
  }
  return refsContext;
}

type DropdownMenuProps<TagType extends React.ElementType> = {
  as?: TagType;
  children: React.ReactNode;
} & React.ComponentProps<TagType>;

export function DropdownMenu<TagType extends React.ElementType>({
  as = "div",
  children,
  ...props
}: DropdownMenuProps<TagType>) {
  const [menuState, dispatch] = useReducer(reducer, initialDropdownMenuState);
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
