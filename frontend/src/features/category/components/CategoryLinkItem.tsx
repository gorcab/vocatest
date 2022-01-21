import { NavLink } from "react-router-dom";
import { useSearchUrl } from "../../common/hooks/useSearchUrl";

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
    pagedVocabularyListsRequest: { category },
  } = useSearchUrl();
  const isActive = category === id;

  return (
    <li className="flex items-center">
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
