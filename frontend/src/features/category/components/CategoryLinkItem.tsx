import { NavLink } from "react-router-dom";
import { useSearchUrl } from "../../common/hooks/useSearchUrl";
import { useCloseSidebar } from "../../common/hooks/useToggleSidebar";

type CategoryLinkItemProps = {
  id: number;
  name: string;
  path: string;
};

export const CategoryLinkItem: React.FC<CategoryLinkItemProps> = ({
  id,
  name,
  path,
}) => {
  const {
    pagedVocabularyListsRequest: { categoryId },
  } = useSearchUrl();
  const closSidebar = useCloseSidebar();
  const isActive = categoryId === id;

  return (
    <li className="flex items-center" onClick={closSidebar}>
      <NavLink
        to={path}
        className={`${
          isActive
            ? "text-blue-500 hover:bg-slate-200"
            : "text-slate-600 hover:bg-slate-200"
        } w-full px-3 py-2 rounded-xl`}
      >
        {name}
      </NavLink>
    </li>
  );
};
