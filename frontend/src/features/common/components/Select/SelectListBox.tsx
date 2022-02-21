import { useEffect } from "react";
import { Keyboard } from "../../utils/constants";
import { Portal } from "../Portal";
import { useSelectContext } from "./context/selectContext";

type SelectListBoxProps = {
  className?: string;
};

export const SelectListBox: React.FC<SelectListBoxProps> = ({
  className,
  children,
}) => {
  const {
    dispatch,
    listBoxRef,
    selectState: { buttonRect, isOpenListBox, focusedValue, values, labelId },
  } = useSelectContext(SelectListBox.name);

  useEffect(() => {
    if (!listBoxRef.current) return;
    if (values.length === 0) return;
    if (isOpenListBox && focusedValue === null) {
      listBoxRef.current.focus();
    }
  }, [isOpenListBox, focusedValue, values, listBoxRef]);

  const keyDownHandler: React.KeyboardEventHandler<HTMLUListElement> = (
    event
  ) => {
    const stopPropagationAndPreventDefaultEvent = (
      event: React.KeyboardEvent<HTMLUListElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();
    };

    switch (event.key) {
      case Keyboard.Tab: {
        stopPropagationAndPreventDefaultEvent(event);
        return;
      }
      case Keyboard.Escape: {
        stopPropagationAndPreventDefaultEvent(event);
        dispatch({ type: "CLOSE_LIST_BOX" });
        dispatch({ type: "FOCUS_SELECT_BUTTON" });
        return;
      }
      case Keyboard.ArrowUp: {
        stopPropagationAndPreventDefaultEvent(event);
        if (focusedValue) {
          dispatch({ type: "FOCUS_PREV" });
        } else {
          dispatch({ type: "FOCUS_LAST" });
        }
        return;
      }
      case Keyboard.ArrowDown: {
        stopPropagationAndPreventDefaultEvent(event);
        if (focusedValue) {
          dispatch({ type: "FOCUS_NEXT" });
        } else {
          dispatch({ type: "FOCUS_FIRST" });
        }
        return;
      }
      case Keyboard.Enter:
      case Keyboard.Space: {
        stopPropagationAndPreventDefaultEvent(event);
        if (focusedValue) {
          dispatch({ type: "SELECT_OPTION", value: focusedValue });
        } else {
          dispatch({ type: "CLOSE_LIST_BOX" });
        }
        dispatch({ type: "FOCUS_SELECT_BUTTON" });
        return;
      }
    }
  };

  const defaultClassName = "absolute";
  const finalClassName = className
    ? `${className} ${defaultClassName}`
    : defaultClassName;
  const topPosition = window.pageYOffset + buttonRect.bottom + 10;
  const widthOfListBox = buttonRect.width;

  return isOpenListBox ? (
    <Portal>
      <ul
        role="listbox"
        ref={listBoxRef}
        aria-labelledby={labelId ?? undefined}
        onKeyDown={keyDownHandler}
        style={{
          top: topPosition,
          width: widthOfListBox,
          left: buttonRect.left,
        }}
        className={finalClassName}
        tabIndex={0}
      >
        {children}
      </ul>
    </Portal>
  ) : null;
};
