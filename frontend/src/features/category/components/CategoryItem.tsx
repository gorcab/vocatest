import { NavLink } from "react-router-dom";

type CategoryItemProps = {
  id: number;
  name: string;
  path: string;
};

export const CategoryItem: React.FC<CategoryItemProps> = ({
  id,
  name,
  path,
}) => {
  return (
    <li className="flex items-center">
      <NavLink
        to={path}
        className={({ isActive }) =>
          `${
            isActive
              ? "text-blue-500 hover:bg-slate-200"
              : "text-slate-600 hover:bg-slate-200"
          } w-full px-3 py-2 rounded-xl`
        }
      >
        {name}
      </NavLink>
    </li>
  );
};
