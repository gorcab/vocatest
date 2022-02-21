import { useDocumentEventHandler } from "features/common/hooks/useDocumentEventHandler";
import { Keyboard } from "features/common/utils/constants";
import { callAllEventHandlers } from "features/common/utils/helper";
import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { Portal } from "../Portal";
import { initialTooltipState, tooltipReducer } from "./reducer";

type TooltipProps = {
  title: string;
};

export const Tooltip: React.FC<TooltipProps> = ({ title, children }) => {
  const [state, dispatch] = useReducer(tooltipReducer, initialTooltipState);
  const { show, isReservedHiddenTimer, isReservedShowTimer } = state;
  const childrenRef = useRef<HTMLElement>(null);
  const isMouseDown = useRef(false);

  useDocumentEventHandler("keydown", (event) => {
    if (!show) return;
    if (event.key === Keyboard.Escape) {
      dispatch({ type: "HIDE" });
    }
  });

  const { top, left } = useMemo(() => {
    if (show && childrenRef.current) {
      let rects = childrenRef.current.getBoundingClientRect();
      const top = window.pageYOffset + rects.top + 20;
      const left = window.pageXOffset + rects.left + rects.width / 2;

      return { top, left };
    } else {
      return { top: 0, left: 0 };
    }
  }, [show]);

  useEffect(() => {
    if (!isReservedShowTimer) return;
    const timerId = setTimeout(() => {
      if (!show) {
        dispatch({ type: "SHOW" });
      }
    }, 100);
    return () => {
      clearTimeout(timerId);
    };
  }, [isReservedShowTimer, show]);

  useEffect(() => {
    if (!isReservedHiddenTimer) return;
    const timerId = setTimeout(() => {
      if (show) {
        dispatch({ type: "HIDE" });
      }
    }, 100);
    return () => {
      clearTimeout(timerId);
    };
  }, [isReservedHiddenTimer, show]);

  if (!React.isValidElement(children) || Array.isArray(children)) {
    throw new TypeError(
      "<Tooltip> Component's children must be single React Element."
    );
  }

  const cancelHiddenTimer = () => {
    if (isReservedHiddenTimer) {
      dispatch({ type: "CANCEL_HIDE_TIMER" });
    }
  };

  const reserveHiddenTimer = () => {
    if (!isReservedHiddenTimer) {
      dispatch({ type: "RESERVE_HIDE_TIMER" });
    }
  };

  const cancelShowTimer = () => {
    if (isReservedShowTimer) {
      dispatch({ type: "CANCEL_SHOW_TIMER" });
    }
  };

  const reserveShowTimer = () => {
    if (!isReservedShowTimer) {
      dispatch({ type: "RESERVE_SHOW_TIMER" });
    }
  };

  const hideImmediately = () => {
    if (show) {
      dispatch({ type: "HIDE" });
    }
  };

  const mouseEnterHandler = () => {
    if (isMouseDown.current) return;
    cancelHiddenTimer();
    reserveShowTimer();
  };

  const mouseDownHandler = () => {
    isMouseDown.current = true;
    cancelShowTimer();
    hideImmediately();
  };

  const mouseLeaveHandler = () => {
    isMouseDown.current = false;
    cancelShowTimer();
    reserveHiddenTimer();
  };

  const focusHandler = () => {
    if (isMouseDown.current) return;
    mouseEnterHandler();
  };

  const blurHandler = () => {
    hideImmediately();
  };
  const clickHandler = () => {
    mouseDownHandler();
  };

  const tooltipMouseEnterHalnder = () => {
    cancelHiddenTimer();
  };

  const tooltipMouseLeaveHandler = () => {
    cancelShowTimer();
    reserveHiddenTimer();
  };

  const { onMouseEnter, onMouseLeave, onMouseDown, onFocus, onBlur, onClick } =
    children.props;

  const ChildComponent = React.cloneElement(children, {
    ...children.props,
    ref: childrenRef,
    "aria-label": title,
    onFocus: callAllEventHandlers(focusHandler, onFocus),
    onBlur: callAllEventHandlers(blurHandler, onBlur),
    onMouseEnter: callAllEventHandlers(mouseEnterHandler, onMouseEnter),
    onMouseDown: callAllEventHandlers(mouseDownHandler, onMouseDown),
    onMouseLeave: callAllEventHandlers(mouseLeaveHandler, onMouseLeave),
    onClick: callAllEventHandlers(clickHandler, onClick),
  });

  return (
    <>
      {ChildComponent}
      {show && (
        <Portal>
          <div
            role="tooltip"
            onMouseEnter={tooltipMouseEnterHalnder}
            onMouseLeave={tooltipMouseLeaveHandler}
            style={{
              top,
              left,
            }}
            className="bg-slate-800 text-white text-xs rounded-sm px-2 py-1 absolute top-1/2 left-1/2 -translate-x-1/2 w-max"
          >
            {title}
          </div>
        </Portal>
      )}
    </>
  );
};
