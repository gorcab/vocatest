import { useId } from "features/common/hooks/useId";
import { useEffect } from "react";
import { useSelectContext } from "./context/selectContext";

type SelectLabelProps = {
  className?: string;
};

export const SelectLabel: React.FC<SelectLabelProps> = ({
  className,
  children,
}) => {
  const labelId = useId("select-label", 4);
  const { dispatch, selectButtonRef } = useSelectContext(SelectLabel.name);

  const focusToSelectButton: React.MouseEventHandler<HTMLLabelElement> = (
    event
  ) => {
    if (!selectButtonRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    selectButtonRef.current.focus();
  };

  useEffect(() => {
    dispatch({ type: "REGISTER_LABEL_ID", id: labelId });
    return () => dispatch({ type: "UNREGISTER_LABEL_ID" });
  }, [labelId, dispatch]);

  return (
    <label onClick={focusToSelectButton} id={labelId} className={className}>
      {children}
    </label>
  );
};
