type TooltipState = {
  show: boolean;
  isReservedShowTimer: boolean;
  isReservedHiddenTimer: boolean;
};

type TooltipAction =
  | { type: "SHOW" }
  | { type: "HIDE" }
  | { type: "RESERVE_SHOW_TIMER" }
  | { type: "CANCEL_SHOW_TIMER" }
  | { type: "RESERVE_HIDE_TIMER" }
  | { type: "CANCEL_HIDE_TIMER" };

export const initialTooltipState: TooltipState = {
  show: false,
  isReservedHiddenTimer: false,
  isReservedShowTimer: false,
};

export function tooltipReducer(
  state: TooltipState,
  action: TooltipAction
): TooltipState {
  switch (action.type) {
    case "SHOW": {
      return { ...state, show: true, isReservedShowTimer: false };
    }
    case "HIDE": {
      return {
        ...state,
        show: false,
        isReservedHiddenTimer: false,
      };
    }
    case "RESERVE_SHOW_TIMER": {
      return { ...state, isReservedShowTimer: true };
    }
    case "CANCEL_SHOW_TIMER": {
      return { ...state, isReservedShowTimer: false };
    }
    case "RESERVE_HIDE_TIMER": {
      return { ...state, isReservedHiddenTimer: true };
    }
    case "CANCEL_HIDE_TIMER": {
      return { ...state, isReservedHiddenTimer: false };
    }
  }
}
