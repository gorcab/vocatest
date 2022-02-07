import { useEffect } from "react";
import { Keyboard } from "../../utils/constants";
import { Portal } from "../Portal";
import { useSelectContext, useSelectRefsContext } from "./Select";

export const SelectListBox: React.FC = ({ children }) => {
  const [state, dispatch] = useSelectContext(SelectListBox.name);
  const { selectButtonRef, listBoxRef } = useSelectRefsContext(
    SelectListBox.name
  );
  const {
    selectLabelId,
    isOpenListBox,
    focusedOptionId,
    buttonRect: { width, top, height, left },
  } = state;
  const topOfListBox = top + height + 10;
  const widthOfListBox = width;

  useEffect(() => {
    if (!listBoxRef.current) return;
    if (isOpenListBox && focusedOptionId === null) {
      listBoxRef.current.focus();
    }
  }, [isOpenListBox, focusedOptionId, listBoxRef]);

  const keyDownHandler: React.KeyboardEventHandler<HTMLUListElement> = (
    event
  ) => {
    switch (event.key) {
      case Keyboard.Tab: {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      case Keyboard.Escape: {
        event.preventDefault();
        event.stopPropagation();
        dispatch({ type: "CLOSE_LIST_BOX" });
        requestAnimationFrame(() => {
          selectButtonRef.current?.focus();
        });
        return;
      }
      case Keyboard.ArrowUp: {
        event.preventDefault();
        event.stopPropagation();
        if (focusedOptionId) {
          dispatch({ type: "FOCUS_PREV" });
        } else {
          dispatch({ type: "FOCUS_LAST" });
        }
        return;
      }
      case Keyboard.ArrowDown: {
        event.preventDefault();
        event.stopPropagation();
        if (focusedOptionId) {
          dispatch({ type: "FOCUS_NEXT" });
        } else {
          dispatch({ type: "FOCUS_FIRST" });
        }
        return;
      }
      case Keyboard.Enter:
      case Keyboard.Space: {
        event.preventDefault();
        event.stopPropagation();
        if (focusedOptionId) {
          dispatch({ type: "SELECT_OPTION", id: focusedOptionId });
        } else {
          dispatch({ type: "CLOSE_LIST_BOX" });
        }
        requestAnimationFrame(() => {
          selectButtonRef.current?.focus();
        });
        return;
      }
    }
  };

  return (
    <Portal>
      <ul
        tabIndex={0}
        aria-labelledby={selectLabelId}
        onKeyDown={keyDownHandler}
        ref={listBoxRef}
        style={{
          top: topOfListBox,
          width: widthOfListBox,
          left: left,
        }}
        role="listbox"
        className={`bg-white absolute py-1 shadow-lg rounded-md z-10 outline-none truncate ${
          isOpenListBox ? "visible" : "invisible"
        }`}
      >
        {children}
      </ul>
    </Portal>
  );
};
