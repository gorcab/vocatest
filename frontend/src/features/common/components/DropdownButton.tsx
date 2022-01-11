import { useDropdown } from "../hooks/useDropdown";

type DropdownButtonProps = {
  className: string;
};

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  className,
  children,
}) => {
  const { isOpen, id, toggleHandler, dropdownToggleButtonRef } = useDropdown();
  return (
    <button
      ref={dropdownToggleButtonRef}
      aria-controls={`menu-${id}`}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={className}
      onClick={toggleHandler}
    >
      {children}
    </button>
  );
};
