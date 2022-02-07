import React, {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { FaCaretDown } from "react-icons/fa";
import { useDocumentEventHandler } from "../../hooks/useDocumentEventHandler";
import { useId } from "../../hooks/useId";
import { isFocusableElement } from "../../utils/helper";
import { SelectButton } from "./SelectButton";
import { SelectListBox } from "./SelectListBox";
import { SelectOption } from "./SelectOption";

type Rect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

export type SelectOptionType<ValueType extends string | number> = {
  id: string;
  value: ValueType;
  label: string;
};

type SelectProps<ValueType extends string | number> = {
  selectLabel: string;
  options: Array<Omit<SelectOptionType<ValueType>, "id">>;
  onChange: (value: ValueType extends string ? string : number) => void;
  onBlur: (value: ValueType extends string ? string : number) => void;
  initialValue?: ValueType extends string ? string : number;
};

type Action<ValueType extends string | number> =
  | { type: "GET_BUTTON_RECT"; rect: Rect }
  | { type: "OPEN_LIST_BOX" }
  | {
      type: "REGISTER_OPTION";
      id: SelectOptionType<ValueType>["id"];
      value: SelectOptionType<ValueType>["value"];
      label: SelectOptionType<ValueType>["label"];
    }
  | { type: "UNREGISTER_OPTION"; id: string }
  | { type: "CLOSE_LIST_BOX" }
  | { type: "SELECT_OPTION"; id: string }
  | { type: "FOCUS_SPECIFIC"; id: string }
  | { type: "UNFOCUS" }
  | { type: "FOCUS_FIRST" }
  | { type: "FOCUS_LAST" }
  | { type: "FOCUS_NEXT" }
  | { type: "FOCUS_PREV" };

type SelectState<ValueType extends string | number> = {
  buttonRect: Rect;
  selectLabelId: string;
  options: Array<SelectOptionType<ValueType>>;
  initialValue?: ValueType;
  selectedOptionId: string | null;
  focusedOptionId: string | null;
  isOpenListBox: boolean;
};

function reducer<ValueType extends string | number>(
  state: SelectState<ValueType extends string ? string : number>,
  action: Action<ValueType extends string ? string : number>
): SelectState<ValueType extends string ? string : number> {
  switch (action.type) {
    case "GET_BUTTON_RECT": {
      return { ...state, buttonRect: { ...action.rect } };
    }
    case "OPEN_LIST_BOX": {
      return {
        ...state,
        isOpenListBox: true,
      };
    }
    case "REGISTER_OPTION": {
      const options: typeof state["options"] = (
        state.options as typeof state["options"]
      ).concat({
        id: action.id,
        value: action.value,
        label: action.label,
      });
      return { ...state, options };
    }
    case "UNREGISTER_OPTION": {
      const indexToUnregister = state.options.findIndex(
        (option) => option.id === action.id
      );
      if (indexToUnregister !== -1) {
        const options = state.options.slice();
        options.splice(indexToUnregister, 1);
        return { ...state, options };
      }
      return { ...state };
    }
    case "CLOSE_LIST_BOX": {
      return { ...state, isOpenListBox: false, focusedOptionId: null };
    }
    case "SELECT_OPTION": {
      return {
        ...state,
        selectedOptionId: action.id,
        focusedOptionId: action.id,
        isOpenListBox: false,
      };
    }
    case "FOCUS_SPECIFIC": {
      return { ...state, focusedOptionId: action.id };
    }
    case "UNFOCUS": {
      return { ...state, focusedOptionId: null };
    }

    case "FOCUS_FIRST": {
      if (state.options.length === 0) {
        return { ...state };
      }
      const focusedOptionId = state.options[0].id;
      return { ...state, focusedOptionId };
    }
    case "FOCUS_LAST": {
      if (state.options.length === 0) {
        return { ...state };
      }
      const focusedOptionId = state.options[state.options.length - 1].id;
      return { ...state, focusedOptionId };
    }
    case "FOCUS_NEXT": {
      let focusedOptionIndex = state.options.findIndex(
        (option) => option.id === state.focusedOptionId
      );
      if (focusedOptionIndex === -1) {
        return { ...state };
      } else if (focusedOptionIndex < state.options.length - 1) {
        focusedOptionIndex += 1;
      }

      return {
        ...state,
        focusedOptionId: state.options[focusedOptionIndex].id,
      };
    }
    case "FOCUS_PREV": {
      let focusedOptionIndex = state.options.findIndex(
        (option) => option.id === state.focusedOptionId
      );
      if (focusedOptionIndex === -1) {
        return { ...state };
      } else {
        if (focusedOptionIndex > 0) {
          focusedOptionIndex -= 1;
        }
        return {
          ...state,
          focusedOptionId: state.options[focusedOptionIndex].id,
        };
      }
    }
    default:
      throw new Error("Invalid Select Action type.");
  }
}

const SelectContext =
  createContext<
    | [SelectState<string | number>, React.Dispatch<Action<string | number>>]
    | null
  >(null);

export function useSelectContext(componentName: string) {
  const selectContext = useContext(SelectContext);
  if (!selectContext) {
    throw new TypeError(
      `<${componentName}> must be within <Select> component.`
    );
  }
  return selectContext;
}

const RefsContext =
  createContext<{
    selectButtonRef: MutableRefObject<HTMLDivElement | null>;
    listBoxRef: MutableRefObject<HTMLUListElement | null>;
  } | null>(null);

export function useSelectRefsContext(componentName: string) {
  const refsContext = useContext(RefsContext);
  if (!refsContext) {
    throw new TypeError(
      `<${componentName}> must be within <Select> component.`
    );
  }

  return refsContext;
}

export function Select<ValueType extends string | number>({
  selectLabel,
  options,
  onChange,
  onBlur,
  initialValue,
}: SelectProps<ValueType>) {
  const labelId = useId("select-label", 2);
  const [selectState, dispatch] = useReducer(reducer, {
    selectLabelId: labelId,
    buttonRect: { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 },
    options: [],
    initialValue,
    selectedOptionId: null,
    focusedOptionId: null,
    isOpenListBox: false,
  });
  const {
    isOpenListBox,
    selectedOptionId,
    options: registeredOptions,
  } = selectState;
  const selectButtonRef = useRef<HTMLDivElement | null>(null);
  const listBoxRef = useRef<HTMLUListElement | null>(null);

  const selectedOptionIndex = useMemo(
    () =>
      registeredOptions.findIndex((option) => option.id === selectedOptionId),
    [selectedOptionId, registeredOptions]
  );

  useDocumentEventHandler("mousedown", (event) => {
    const target = event.target as HTMLElement;
    if (!isOpenListBox) return;
    if (selectButtonRef.current?.contains(target)) return;
    if (listBoxRef.current?.contains(target)) return;
    dispatch({ type: "CLOSE_LIST_BOX" });
    if (!isFocusableElement(target)) {
      event.preventDefault();
      event.stopPropagation();
      selectButtonRef.current?.focus();
    }
  });

  useEffect(() => {
    if (!selectButtonRef.current) return;
    if (!listBoxRef.current) return;
    if (selectedOptionIndex === -1) return;
    onChange(
      registeredOptions[selectedOptionIndex].value as ValueType extends string
        ? string
        : number
    );
  }, [selectedOptionIndex, onChange, registeredOptions]);

  const labelClickHandler = () => {
    if (selectButtonRef.current) {
      selectButtonRef.current.focus();
    }
  };

  return (
    <SelectContext.Provider value={[selectState, dispatch]}>
      <RefsContext.Provider value={{ selectButtonRef, listBoxRef }}>
        <div className="inline-flex flex-col text-gray-700 text-sm">
          <label onClick={labelClickHandler} className="pb-2" id={labelId}>
            {selectLabel}
          </label>
          <SelectButton onBlur={onBlur}>
            {selectedOptionIndex === -1
              ? ""
              : registeredOptions[selectedOptionIndex].label}
            <span>
              <FaCaretDown className="text-gray-700" />
            </span>
          </SelectButton>
          <SelectListBox>
            {options.map((option) => (
              <SelectOption
                key={option.value}
                value={option.value}
                label={option.label}
              />
            ))}
          </SelectListBox>
        </div>
      </RefsContext.Provider>
    </SelectContext.Provider>
  );
}
