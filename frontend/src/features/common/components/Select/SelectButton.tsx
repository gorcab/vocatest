import { useId } from "features/common/hooks/useId";
import { Keyboard } from "features/common/utils/constants";
import { debounce } from "features/common/utils/helper";
import { PropsWithChildren, useCallback, useEffect } from "react";
import { useSelectContext } from "./context/selectContext";

type SelectButtonProps<ValueType extends string | number> = {
  className?: string;
  onBlur?: (value: ValueType) => void;
};

export function SelectButton<ValueType extends string | number>({
  className,
  onBlur,
  children,
}: PropsWithChildren<SelectButtonProps<ValueType>>) {
  const buttonId = useId("select-button", 4);
  const {
    selectButtonRef,
    selectState: { selectedValue, isOpenListBox, focusButton, labelId },
    dispatch,
  } = useSelectContext(SelectButton.name);

  useEffect(() => {
    if (!selectButtonRef.current) return;
    if (focusButton) {
      selectButtonRef.current.focus();
    }
  }, [focusButton, selectButtonRef]);

  const getRect = useCallback(() => {
    if (!selectButtonRef.current) return;
    const { top, right, bottom, left, width, height } =
      selectButtonRef.current.getBoundingClientRect();
    dispatch({
      type: "GET_BUTTON_RECT",
      rect: {
        top,
        right,
        bottom,
        left,
        width,
        height,
      },
    });
  }, [selectButtonRef, dispatch]);

  useEffect(() => {
    const debouncedGetRect = debounce(getRect, 100, true);
    debouncedGetRect();
    window.addEventListener("resize", debouncedGetRect);
    return () => {
      debouncedGetRect.cancel();
      window.removeEventListener("resize", debouncedGetRect);
    };
  }, [getRect]);

  const openListBox = () => {
    getRect();
    dispatch({ type: "OPEN_LIST_BOX" });
    dispatch({ type: "FOCUS_SPECIFIC_VALUE", value: selectedValue });
  };

  const keyDownHandler: React.KeyboardEventHandler<HTMLDivElement> = (
    event
  ) => {
    switch (event.key) {
      case Keyboard.Space:
      case Keyboard.Enter:
      case Keyboard.ArrowUp:
      case Keyboard.ArrowDown: {
        event.preventDefault();
        event.stopPropagation();
        openListBox();
      }
    }
  };

  const toggleListBoxVisibility = () => {
    if (isOpenListBox) {
      dispatch({ type: "CLOSE_LIST_BOX" });
      dispatch({ type: "FOCUS_SELECT_BUTTON" });
    } else {
      openListBox();
    }
  };

  const blurHandler = () => {
    if (!selectedValue && isOpenListBox) return;
    onBlur?.(selectedValue as ValueType);
  };

  return (
    <div
      ref={selectButtonRef}
      className={className}
      role="button"
      tabIndex={0}
      onClick={toggleListBoxVisibility}
      onKeyDown={keyDownHandler}
      onBlur={blurHandler}
      aria-haspopup="listbox"
      aria-expanded={isOpenListBox}
      aria-labelledby={`${labelId} ${buttonId}`}
    >
      {children}
    </div>
  );
}
