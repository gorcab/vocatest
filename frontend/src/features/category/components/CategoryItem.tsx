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
              ? "bg-blue-500 text-white hover:opacity-80"
              : "text-slate-600 hover:bg-slate-200 focus:bg-slate-200"
          } w-full px-3 py-2 rounded-xl`
        }
      >
        {name}
      </NavLink>
    </li>
  );
};
