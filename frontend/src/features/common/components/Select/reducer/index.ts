type Rect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

export type SelectState<ValueType extends string | number = string | number> = {
  selectedValue: ValueType;
  labelId: string | null;
  focusedValue: ValueType | null;
  isOpenListBox: boolean;
  values: Array<ValueType>;
  focusButton: boolean;
  buttonRect: Rect;
};

export type SelectAction<ValueType extends string | number = string | number> =
  | { type: "GET_BUTTON_RECT"; rect: Rect }
  | { type: "REGISTER_SELECT_OPTION"; value: ValueType }
  | { type: "UNREGISTER_SELECT_OPTION"; value: ValueType }
  | { type: "REGISTER_LABEL_ID"; id: string }
  | { type: "UNREGISTER_LABEL_ID" }
  | { type: "OPEN_LIST_BOX" }
  | { type: "CLOSE_LIST_BOX" }
  | { type: "SELECT_OPTION"; value: ValueType }
  | { type: "FOCUS_SELECT_BUTTON" }
  | { type: "FOCUS_FIRST" }
  | { type: "FOCUS_LAST" }
  | { type: "FOCUS_PREV" }
  | { type: "FOCUS_NEXT" }
  | { type: "FOCUS_SPECIFIC_VALUE"; value: ValueType }
  | { type: "UNFOCUS" };

export function selectReducer(
  state: SelectState,
  action: SelectAction
): SelectState {
  switch (action.type) {
    case "GET_BUTTON_RECT": {
      return { ...state, buttonRect: action.rect };
    }
    case "REGISTER_SELECT_OPTION": {
      const values = state.values.concat(action.value);
      return { ...state, values };
    }
    case "UNREGISTER_SELECT_OPTION": {
      const valueIndexToRemove = state.values.findIndex(
        (option) => option === action.value
      );
      if (valueIndexToRemove === -1) return { ...state };

      const values = state.values.slice();
      values.splice(valueIndexToRemove, 1);
      return { ...state, values };
    }
    case "REGISTER_LABEL_ID": {
      return { ...state, labelId: action.id };
    }
    case "UNREGISTER_LABEL_ID": {
      return { ...state, labelId: null };
    }
    case "OPEN_LIST_BOX": {
      const focusedValue = state.selectedValue
        ? state.selectedValue
        : state.values[0];
      return {
        ...state,
        isOpenListBox: true,
        focusedValue,
        focusButton: false,
      };
    }
    case "CLOSE_LIST_BOX": {
      return { ...state, isOpenListBox: false, focusedValue: null };
    }
    case "SELECT_OPTION": {
      const selectedValue = action.value;
      return {
        ...state,
        isOpenListBox: false,
        selectedValue,
        focusedValue: null,
        focusButton: true,
      };
    }
    case "FOCUS_SELECT_BUTTON": {
      return { ...state, focusButton: true };
    }
    case "FOCUS_FIRST": {
      const focusedIndex = state.values.length > 0 ? 0 : -1;
      if (focusedIndex === -1) return { ...state };
      return { ...state, focusedValue: state.values[focusedIndex] };
    }
    case "FOCUS_LAST": {
      const focusedIndex =
        state.values.length > 0 ? state.values.length - 1 : -1;
      if (focusedIndex === -1) return { ...state };
      return { ...state, focusedValue: state.values[focusedIndex] };
    }
    case "FOCUS_PREV": {
      let focusedIndex = state.values.findIndex(
        (value) => value === state.focusedValue
      );
      if (focusedIndex === -1) {
        return { ...state };
      } else if (focusedIndex > 0) {
        focusedIndex -= 1;
      }

      return {
        ...state,
        focusedValue: state.values[focusedIndex],
      };
    }
    case "FOCUS_NEXT": {
      let focusedIndex = state.values.findIndex(
        (value) => value === state.focusedValue
      );
      if (focusedIndex === -1 || focusedIndex >= state.values.length - 1) {
        return { ...state };
      }
      focusedIndex += 1;

      return {
        ...state,
        focusedValue: state.values[focusedIndex],
      };
    }

    case "FOCUS_SPECIFIC_VALUE": {
      const focusedValue = action.value;
      return { ...state, focusedValue };
    }
    case "UNFOCUS": {
      return { ...state, focusedValue: null };
    }
    default: {
      throw new TypeError(
        `${(action as SelectAction).type} Action is invalid SelectAction.`
      );
    }
  }
}
