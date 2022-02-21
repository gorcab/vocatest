import { PropsWithChildren, useEffect, useReducer, useRef } from "react";
import { useDocumentEventHandler } from "features/common/hooks/useDocumentEventHandler";
import { SelectContext } from "./context/selectContext";
import { selectReducer } from "./reducer";
import { isFocusableElement } from "features/common/utils/helper";

type SelectProps<ValueType extends string | number> = {
  value: ValueType;
  onChange: (value: ValueType) => void;
};

export function Select<ValueType extends string | number>({
  value,
  onChange,
  children,
}: PropsWithChildren<SelectProps<ValueType>>) {
  const [state, dispatch] = useReducer(selectReducer, {
    selectedValue: value,
    labelId: null,
    focusedValue: value ?? null,
    isOpenListBox: false,
    values: [],
    focusButton: false,
    buttonRect: { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 },
  });
  const { isOpenListBox, selectedValue } = state;
  const selectButtonRef = useRef<HTMLDivElement | null>(null);
  const prevSelectedValue = useRef<ValueType>(value);
  const listBoxRef = useRef<HTMLUListElement | null>(null);
  const contextValue = {
    selectState: state,
    dispatch,
    selectButtonRef,
    listBoxRef,
  };

  useDocumentEventHandler("mousedown", (event) => {
    if (!selectButtonRef.current) return;
    if (!listBoxRef.current) return;
    if (!isOpenListBox) return;
    const target = event.target as HTMLElement;
    if (selectButtonRef.current.contains(target)) return;
    if (listBoxRef.current.contains(target)) return;

    dispatch({ type: "CLOSE_LIST_BOX" });

    if (!isFocusableElement(target)) {
      event.preventDefault();
      event.stopPropagation();
      dispatch({ type: "FOCUS_SELECT_BUTTON" });
    }
  });

  useEffect(() => {
    if (selectedValue && prevSelectedValue.current !== selectedValue) {
      onChange(selectedValue as ValueType);
      prevSelectedValue.current = selectedValue as ValueType;
    }
  }, [selectedValue, onChange]);

  return (
    <SelectContext.Provider value={contextValue}>
      {children}
    </SelectContext.Provider>
  );
}
