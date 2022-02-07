import { MutableRefObject, useLayoutEffect } from "react";
import { useId } from "../../hooks/useId";
import { Keyboard } from "../../utils/constants";
import { callAllEventHandlers } from "../../utils/helper";
import { useMenuContext, useRefsContext } from "./DropdownMenu";

type DropdownMenuButtonProps = React.HTMLProps<HTMLButtonElement>;

export const DropdownMenuButton: React.FC<DropdownMenuButtonProps> = ({
  children,
  ...props
}) => {
  const { ref, type, onClick, onKeyDown, disabled, ...restProps } = props;
  const buttonId = useId();
  const { buttonRef, itemsRef } = useRefsContext(DropdownMenuButton.name);
  const [{ isOpen, itemListId }, dispatch] = useMenuContext(
    DropdownMenuButton.name
  );

  useLayoutEffect(() => {
    dispatch({ type: "REGISTER_BUTTON", id: buttonId });
  }, [buttonId, dispatch]);

  const resolveRefs = ref
    ? (buttonElement: HTMLButtonElement | null) => {
        typeof ref === "function"
          ? ref(buttonElement)
          : ((ref as MutableRefObject<HTMLButtonElement | null>).current =
              buttonElement);

        buttonRef.current = buttonElement;
      }
    : buttonRef;

  const keyDownHandler: React.KeyboardEventHandler<HTMLButtonElement> = (
    event
  ) => {
    if (disabled) return;
    switch (event.key) {
      case Keyboard.Space:
      case Keyboard.Enter:
      case Keyboard.ArrowDown: {
        event.preventDefault();
        event.stopPropagation();
        dispatch({ type: "OPEN_MENU" });
        requestAnimationFrame(() => {
          dispatch({ type: "FOCUS", focusType: "FOCUS_FIRST" });
        });
        return;
      }
      case Keyboard.ArrowUp: {
        event.preventDefault();
        event.stopPropagation();
        dispatch({ type: "OPEN_MENU" });
        requestAnimationFrame(() => {
          dispatch({ type: "FOCUS", focusType: "FOCUS_LAST" });
        });
        return;
      }
    }
  };

  const clickHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    if (isOpen) {
      dispatch({ type: "CLOSE_MENU" });
    } else {
      dispatch({ type: "OPEN_MENU" });
      requestAnimationFrame(() => {
        itemsRef.current?.focus();
      });
    }
  };

  const clickHandlers = callAllEventHandlers(onClick, clickHandler);

  return (
    <button
      type={(type as "button" | "submit" | "reset" | undefined) || "button"}
      ref={resolveRefs}
      disabled={disabled}
      aria-haspopup={true}
      aria-controls={itemListId ?? undefined}
      aria-expanded={disabled ? undefined : isOpen}
      onClick={clickHandlers}
      onKeyDown={keyDownHandler}
      {...restProps}
    >
      {children}
    </button>
  );
};
