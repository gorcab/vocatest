import React, {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useDocumentEventHandler } from "../hooks/useDocumentEventHandler";
import { Keyboard } from "../utils/constants";
import { callAllEventHandlers, debounce } from "../utils/helper";
import { Portal } from "./Portal";

type Rect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

type State = {
  show: boolean;
  escKeyDown: boolean;
  isTriggeredShowTimer: boolean;
  isTriggeredHiddenTimer: boolean;
};

type TooltipProps = {
  title: string;
};

type TooltipAction =
  | { type: "SHOW" }
  | { type: "HIDDEN" }
  | { type: "TRIGGER_SHOW_TIMER" }
  | { type: "CANCEL_SHOW_TIMER" }
  | { type: "TRIGGER_HIDDEN_TIMER" }
  | { type: "CANCEL_HIDDEN_TIMER" }
  | { type: "ESC_KEY_DOWN" };

function reducer(state: State, action: TooltipAction): State {
  switch (action.type) {
    case "SHOW": {
      return { ...state, show: true };
    }
    case "ESC_KEY_DOWN": {
      return { ...state, escKeyDown: true };
    }
    case "HIDDEN": {
      return { ...state, show: false, escKeyDown: false };
    }

    case "TRIGGER_SHOW_TIMER": {
      return { ...state, isTriggeredShowTimer: true };
    }
    case "CANCEL_SHOW_TIMER": {
      return { ...state, isTriggeredShowTimer: false };
    }
    case "TRIGGER_HIDDEN_TIMER": {
      return { ...state, isTriggeredHiddenTimer: true };
    }
    case "CANCEL_HIDDEN_TIMER": {
      return { ...state, isTriggeredHiddenTimer: false };
    }
    default:
      throw new TypeError("Invalid TooltipAction.");
  }
}

const initialTooltipState: State = {
  show: false,
  escKeyDown: false,
  isTriggeredHiddenTimer: false,
  isTriggeredShowTimer: false,
};

const initialRect: Rect = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: 0,
  height: 0,
};

export const Tooltip: React.FC<TooltipProps> = ({ title, children }) => {
  const [
    { show, escKeyDown, isTriggeredHiddenTimer, isTriggeredShowTimer },
    dispatch,
  ] = useReducer(reducer, initialTooltipState);
  const [childrenPos, setChildrenPos] = useState<Rect>(initialRect);

  const childrenRef = useRef<HTMLElement>(null);

  useDocumentEventHandler("keydown", (event) => {
    if (escKeyDown || !show) return;
    if (event.key === Keyboard.Escape) {
      dispatch({ type: "ESC_KEY_DOWN" });
    }
  });

  useLayoutEffect(() => {
    if (!childrenRef.current) return;
    const getChildrenRect = () => {
      if (!childrenRef.current) return;
      const { top, right, bottom, left, width, height } =
        childrenRef.current.getBoundingClientRect();
      setChildrenPos({
        top: window.pageYOffset + top,
        right: window.pageXOffset + right,
        bottom: window.pageYOffset + bottom,
        left: window.pageXOffset + left,
        width,
        height,
      });
    };
    getChildrenRect();
    const debouncedGetChildrenRect = debounce(getChildrenRect, 200);
    window.addEventListener("resize", debouncedGetChildrenRect);
    return () => {
      window.removeEventListener("resize", debouncedGetChildrenRect);
    };
  }, []);

  useEffect(() => {
    if (!isTriggeredShowTimer) return;
    const timerId = setTimeout(() => {
      if (!show) {
        dispatch({ type: "SHOW" });
      }
    }, 100);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isTriggeredShowTimer, show]);

  useEffect(() => {
    if (!isTriggeredHiddenTimer) return;

    const timerId = setTimeout(() => {
      if (show) {
        dispatch({ type: "HIDDEN" });
      }
    }, 100);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isTriggeredHiddenTimer, show]);

  if (!React.isValidElement(children) || Array.isArray(children)) {
    throw new TypeError(
      "<Tooltip> Component's children must be single React Element."
    );
  }

  const triggerShowHandler = () => {
    if (isTriggeredHiddenTimer) {
      dispatch({ type: "CANCEL_HIDDEN_TIMER" });
    }
    if (!show && !escKeyDown && !isTriggeredShowTimer) {
      dispatch({ type: "TRIGGER_SHOW_TIMER" });
    }
  };

  const triggerHiddenHandler = () => {
    if (isTriggeredShowTimer) {
      dispatch({ type: "CANCEL_SHOW_TIMER" });
    }

    if (show && !isTriggeredHiddenTimer) {
      dispatch({ type: "TRIGGER_HIDDEN_TIMER" });
    }
  };

  const { onMouseEnter, onMouseLeave, onMouseMove, onFocus, onBlur } =
    children.props;

  const ChildComponent = React.cloneElement(
    children,
    Object.assign(
      {},
      {
        ref: childrenRef,
        "aria-label": title,
        onFocus: callAllEventHandlers(triggerShowHandler, onFocus),
        onBlur: callAllEventHandlers(triggerHiddenHandler, onBlur),
        onMouseEnter: callAllEventHandlers(triggerShowHandler, onMouseEnter),
        onMouseLeave: callAllEventHandlers(triggerHiddenHandler, onMouseLeave),
        onMouseMove: callAllEventHandlers(triggerShowHandler, onMouseMove),
        ...children.props,
      }
    )
  );

  return (
    <>
      {ChildComponent}
      {show && !escKeyDown && childrenRef.current && (
        <Portal>
          <div
            role="tooltip"
            onMouseEnter={triggerShowHandler}
            onMouseMove={triggerShowHandler}
            onMouseLeave={triggerHiddenHandler}
            style={{
              position: "absolute",
              top: childrenPos.top + 20,
              left: childrenPos.left + childrenPos.width / 2,
              transform: `translateX(-50%)`,
            }}
            className="bg-slate-800 text-white text-xs rounded-sm px-2 py-1 absolute top-1/2 left-1/2 w-max"
          >
            {title}
          </div>
        </Portal>
      )}
    </>
  );
};
