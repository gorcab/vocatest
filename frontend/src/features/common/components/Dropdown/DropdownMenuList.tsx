import { AnimatePresence } from "framer-motion";
import React, { MutableRefObject, useEffect, useLayoutEffect } from "react";
import { useId } from "../../hooks/useId";
import { Keyboard } from "../../utils/constants";
import { useMenuContext, useRefsContext } from "./DropdownMenu";

type DropdownMenuListProps<TagType extends React.ElementType> = {
  as?: TagType;
  children: React.ReactNode;
} & React.ComponentProps<TagType>;

export function DropdownMenuList<TagType extends React.ElementType>({
  as = "div",
  children,
  ...props
}: DropdownMenuListProps<TagType>) {
  const { ref, onKeyDown, role, className, ...restProps } = props;
  const defaultClassName =
    "absolute top-[110%] w-24 rounded-sm border right-0 flex flex-col z-30 outline-none";
  const [{ isOpen, buttonId, items, activeItemIndex }, dispatch] =
    useMenuContext(DropdownMenuList.name);
  const { buttonRef, itemsRef } = useRefsContext(DropdownMenuList.name);
  const itemListId = useId();
  const resolveRefs = ref
    ? (divElement: HTMLDivElement | null) => {
        typeof ref === "function"
          ? ref(divElement)
          : ((ref as MutableRefObject<HTMLDivElement | null>).current =
              divElement);
        itemsRef.current = divElement;
      }
    : itemsRef;

  useLayoutEffect(() => {
    dispatch({ type: "REGISTER_ITEM_LIST", id: itemListId });
  }, [dispatch, itemsRef, itemListId, isOpen]);

  useEffect(() => {
    if (!itemsRef.current) return;
    if (isOpen && activeItemIndex === null) {
      itemsRef.current.focus();
    }
  }, [itemsRef, isOpen, activeItemIndex]);

  const keyDownHandler: React.KeyboardEventHandler<HTMLDivElement> = (
    event
  ) => {
    switch (event.key) {
      case Keyboard.Enter:
      case Keyboard.Space: {
        event.preventDefault();
        event.stopPropagation();
        if (activeItemIndex !== null) {
          dispatch({ type: "CLICK_ACTIVE_ITEM" });
        }
        buttonRef.current?.focus();
        requestAnimationFrame(() => {
          dispatch({ type: "CLOSE_MENU" });
        });
        return;
      }
      case Keyboard.ArrowDown: {
        event.preventDefault();
        event.stopPropagation();
        return dispatch({ type: "FOCUS", focusType: "FOCUS_NEXT" });
      }
      case Keyboard.ArrowUp: {
        event.preventDefault();
        event.stopPropagation();
        return dispatch({ type: "FOCUS", focusType: "FOCUS_PREV" });
      }
      case Keyboard.Home:
      case Keyboard.PageUp: {
        event.preventDefault();
        event.stopPropagation();
        return dispatch({ type: "FOCUS", focusType: "FOCUS_FIRST" });
      }
      case Keyboard.End:
      case Keyboard.PageDown: {
        event.preventDefault();
        event.stopPropagation();
        return dispatch({ type: "FOCUS", focusType: "FOCUS_LAST" });
      }
      case Keyboard.Escape: {
        event.preventDefault();
        event.stopPropagation();
        dispatch({ type: "CLOSE_MENU" });
        requestAnimationFrame(() => {
          buttonRef.current?.focus();
        });
        return;
      }
      case Keyboard.Tab: {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
  };

  const Wrapper = React.createElement(
    as,
    Object.assign(
      {},
      {
        ...restProps,
        ref: resolveRefs,
        className: className
          ? `${defaultClassName} ${className}`
          : defaultClassName,
        role: "menu",
        tabIndex: 0,
        key: itemListId,
        onKeyDown: keyDownHandler,
        "aria-activedescendant":
          activeItemIndex !== null ? items[activeItemIndex].id : undefined,
        "aria-labelledby": buttonId ? buttonId : undefined,
      }
    ),
    children
  );

  return <AnimatePresence>{isOpen && Wrapper}</AnimatePresence>;
}
