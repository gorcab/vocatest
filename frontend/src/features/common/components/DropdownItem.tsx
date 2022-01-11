import { Link } from "react-router-dom";

type DropdownItemProps =
  | {
      as: "link";
      to: string;
    }
  | {
      as: "button";
      onClick: React.MouseEventHandler<HTMLButtonElement>;
    };

export const DropdownItem: React.FC<DropdownItemProps> = (props) => {
  let ChildrenWrapper: React.ReactElement;
  if (props.as === "button") {
    ChildrenWrapper = (
      <button
        type="button"
        className="p-2 w-full text-left"
        onClick={props.onClick}
      >
        {props.children}
      </button>
    );
  } else {
    ChildrenWrapper = (
      <Link to={props.to} className="p-2 block w-full">
        {props.children}
      </Link>
    );
  }

  return (
    <li
      className="flex items-center bg-white border-b text-slate-500 hover:text-slate-700 text-sm"
      role="menuitem"
    >
      {ChildrenWrapper}
    </li>
  );
};
