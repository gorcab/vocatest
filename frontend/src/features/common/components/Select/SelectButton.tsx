import { useLayoutEffect } from "react";
import { useId } from "../../hooks/useId";
import { Keyboard } from "../../utils/constants";
import { debounce } from "../../utils/helper";
import { useSelectContext, useSelectRefsContext } from "./Select";

type SelectButtonProps<ValueType extends string | number> = {
  onBlur: (value: ValueType extends string ? string : number) => void;
  children: React.ReactNode;
};

export function SelectButton<ValueType extends string | number>({
  onBlur,
  children,
}: SelectButtonProps<ValueType>) {
  const buttonId = useId("select-button", 2);
  const [state, dispatch] = useSelectContext(SelectButton.name);
  const { selectLabelId, isOpenListBox, selectedOptionId, options } = state;
  const { selectButtonRef } = useSelectRefsContext(SelectButton.name);

  useLayoutEffect(() => {
    const getSelectButtonRect = () => {
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
    };
    getSelectButtonRect();
    const debouncedGetSelectButtonRect = debounce(getSelectButtonRect, 200);
    window.addEventListener("resize", debouncedGetSelectButtonRect);

    return () => {
      window.removeEventListener("resize", debouncedGetSelectButtonRect);
    };
  }, [dispatch, selectButtonRef]);

  const focusHandler = () => {
    if (!selectedOptionId) {
      dispatch({ type: "FOCUS_FIRST" });
    } else {
      dispatch({ type: "FOCUS_SPECIFIC", id: selectedOptionId });
    }
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
        dispatch({ type: "OPEN_LIST_BOX" });
        focusHandler();
        return;
      }
    }
  };

  const toggleListBoxHandler = () => {
    if (isOpenListBox) {
      dispatch({ type: "CLOSE_LIST_BOX" });
    } else {
      dispatch({ type: "OPEN_LIST_BOX" });
      focusHandler();
    }
  };

  const blurHandler: React.FocusEventHandler = () => {
    if (!selectedOptionId) return;
    const selectedOption = options.find(
      (option) => option.id === selectedOptionId
    );
    if (selectedOption) {
      onBlur(
        selectedOption.value as ValueType extends string ? string : number
      );
    }
  };

  return (
    <div
      className={`border-b border-slate-400 flex ${
        selectedOptionId === null ? "justify-end" : "justify-between"
      } items-center w-full h-6 text-left outline-none focus:border-b-blue-500 ${
        selectedOptionId === null ? "text-gray-500" : "text-black"
      }`}
      aria-labelledby={`${selectLabelId} ${buttonId}`}
      role="button"
      tabIndex={0}
      ref={selectButtonRef}
      onClick={toggleListBoxHandler}
      onKeyDown={keyDownHandler}
      onBlur={blurHandler}
      aria-haspopup="listbox"
      aria-expanded={isOpenListBox}
    >
      {children}
    </div>
  );
}
