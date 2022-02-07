import { useLayoutEffect, useRef } from "react";
import { useId } from "../../hooks/useId";
import { useSelectContext, useSelectRefsContext } from "./Select";

type SelectOptionProps = {
  value: string | number;
  label: string;
};

export const SelectOption: React.FC<SelectOptionProps> = ({ value, label }) => {
  const id = useId();
  const optionRef = useRef<HTMLLIElement | null>(null);
  const [state, dispatch] = useSelectContext(SelectOption.name);
  const { selectButtonRef } = useSelectRefsContext(SelectOption.name);
  const { isOpenListBox, selectedOptionId, focusedOptionId, initialValue } =
    state;

  useLayoutEffect(() => {
    dispatch({ type: "REGISTER_OPTION", id, value, label });
    if (initialValue && value === initialValue) {
      dispatch({ type: "SELECT_OPTION", id });
    }
    return () => {
      dispatch({ type: "UNREGISTER_OPTION", id });
    };
  }, [id, dispatch, label, value, initialValue]);

  useLayoutEffect(() => {
    if (isOpenListBox && focusedOptionId === id) {
      optionRef.current?.focus();
    }
  }, [isOpenListBox, focusedOptionId, id]);

  const clickHandler = () => {
    dispatch({ type: "SELECT_OPTION", id });
    requestAnimationFrame(() => {
      selectButtonRef.current?.focus();
    });
  };

  const mouseMoveHandler: React.MouseEventHandler<HTMLLIElement> = () => {
    if (focusedOptionId !== id) {
      dispatch({ type: "FOCUS_SPECIFIC", id });
    }
  };

  const mouseLeaveHandler: React.MouseEventHandler<HTMLLIElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (focusedOptionId === id) {
      dispatch({ type: "UNFOCUS" });
    }
  };

  return (
    <li
      ref={optionRef}
      className="cursor-pointer px-1 py-3 text-gray-600 outline-none focus:bg-gray-200 hover:bg-gray-100"
      role="option"
      tabIndex={-1}
      aria-selected={id === selectedOptionId}
      onClick={clickHandler}
      onMouseLeave={mouseLeaveHandler}
      onMouseMove={mouseMoveHandler}
    >
      {label}
    </li>
  );
};
