import { useId } from "features/common/hooks/useId";
import { callAllEventHandlers } from "features/common/utils/helper";
import React, { useLayoutEffect, useRef } from "react";
import { useMenuContext, useRefsContext } from "./context";

type DropdownItemProps<TagType extends React.ElementType> = {
  as: TagType;
  children: React.ReactNode;
} & React.ComponentProps<TagType>;

export function DropdownMenuItem<TagType extends React.ElementType>({
  as,
  children,
  ...props
}: DropdownItemProps<TagType>) {
  const { onClick, onKeyDown, className, ref, ...restProps } = props;
  const defaultClassName =
    "p-2 w-full text-left flex items-center bg-white border-b text-slate-500 outline-none hover:text-slate-700 focus:bg-blue-200 text-sm";
  const [{ items, activeItemIndex }, dispatch] = useMenuContext(
    DropdownMenuItem.name
  );
  const { buttonRef } = useRefsContext(DropdownMenuItem.name);

  const itemId = useId();
  const itemRef = useRef<React.ComponentProps<TagType> | null>(null);

  useLayoutEffect(() => {
    dispatch({ type: "REGISTER_ITEM", id: itemId });
  }, [dispatch, itemId]);

  useLayoutEffect(() => {
    if (activeItemIndex === null) {
      if (document.activeElement === itemRef.current) {
        itemRef.current?.blur();
      }
      return;
    }
    if (items[activeItemIndex].id === itemId) {
      const item = items[activeItemIndex];
      if (item.click) {
        itemRef.current?.click?.();
      } else if (item.focus) {
        itemRef.current?.focus?.();
      }
    }
  }, [items, activeItemIndex, itemId]);

  const clickHandler: React.MouseEventHandler<HTMLElement> = (event) => {
    dispatch({ type: "CLOSE_MENU" });
    buttonRef.current?.focus();
  };

  const clickHandlers = callAllEventHandlers(clickHandler, onClick);

  const keyDownHandlers = onKeyDown ? callAllEventHandlers(onKeyDown) : null;

  const focusHandler: React.FocusEventHandler<HTMLElement> = () => {
    if (activeItemIndex && items[activeItemIndex].id === itemId) return;
    dispatch({ type: "FOCUS_ITEM", id: itemId });
  };

  const leaveHandler: React.MouseEventHandler<HTMLElement> = () => {
    if (activeItemIndex !== null && items[activeItemIndex].id === itemId) {
      return dispatch({ type: "FOCUS", focusType: "UNFOCUS" });
    }
  };

  const moveHandler: React.MouseEventHandler<HTMLElement> = () => {
    if (activeItemIndex === null || items[activeItemIndex].id !== itemId) {
      return dispatch({ type: "FOCUS_ITEM", id: itemId });
    }
  };

  const Wrapper = React.createElement(
    as,
    Object.assign(
      {},
      {
        children,
        ref: itemRef,
        role: "menuitem",
        tabIndex: -1,
        className: className
          ? `${defaultClassName} ${className}`
          : defaultClassName,
        onClick: clickHandlers,
        onKeyDown: keyDownHandlers,
        onFocus: focusHandler,
        onMouseMove: moveHandler,
        onMouseLeave: leaveHandler,
        ...restProps,
      }
    )
  );

  return Wrapper;
}
