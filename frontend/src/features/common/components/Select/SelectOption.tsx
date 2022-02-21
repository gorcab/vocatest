import { useEffect, useRef } from "react";
import { useSelectContext } from "./context/selectContext";

type SelectOptionProps = {
  className?: string;
  value: string | number;
};

export const SelectOption: React.FC<SelectOptionProps> = ({
  className,
  value,
  children,
}) => {
  const { selectState, dispatch } = useSelectContext(SelectOption.name);
  const optionRef = useRef<HTMLLIElement | null>(null);
  const { selectedValue, isOpenListBox, focusedValue } = selectState;
  const isFocused = focusedValue ? value === focusedValue : false;
  const isSelected = selectedValue ? value === selectedValue : false;

  useEffect(() => {
    dispatch({ type: "REGISTER_SELECT_OPTION", value });
    return () => dispatch({ type: "UNREGISTER_SELECT_OPTION", value });
  }, [dispatch, value]);

  useEffect(() => {
    if (!optionRef.current) return;
    if (isOpenListBox && isFocused) {
      optionRef.current.focus();
    }
  }, [isOpenListBox, isFocused]);

  const selectOption = () => {
    dispatch({ type: "SELECT_OPTION", value });
  };

  const mouseMoveHandler = () => {
    if (!isFocused) {
      dispatch({ type: "FOCUS_SPECIFIC_VALUE", value });
    }
  };

  const mouseLeaveHandler = () => {
    if (isFocused) {
      dispatch({ type: "UNFOCUS" });
    }
  };

  return (
    <li
      ref={optionRef}
      role="option"
      tabIndex={-1}
      className={className}
      aria-selected={isSelected}
      onClick={selectOption}
      onMouseMove={mouseMoveHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      {children}
    </li>
  );
};
