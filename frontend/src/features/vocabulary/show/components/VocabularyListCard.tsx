import { Link, useSearchParams } from "react-router-dom";
import { CategoryDto } from "features/api/types";
import { Card } from "features/common/components/Card";
import { DEFAULT_PER_PAGE } from "features/common/utils/constants";
import { getFormattedDate } from "features/common/utils/helper";
import { VocabularyListCardDropdownMenu } from "./VocabularyListCardDropdownMenu";

type VocabularyListCardProps = {
  id: number;
  title: string;
  numOfVocabularies: number;
  createdAt: string;
  category: CategoryDto;
};

export const VocabularyListCard: React.FC<VocabularyListCardProps> = ({
  id,
  title,
  numOfVocabularies,
  createdAt,
  category,
}) => {
  const formattedDate = getFormattedDate(new Date(createdAt));
  const [searchParams] = useSearchParams();
  const perPage = searchParams.get("perPage") || DEFAULT_PER_PAGE;

  return (
    <>
      <Card
        as="li"
        className="transform-gpu hover:-translate-y-1 hover:shadow-blue-200 duration-200"
      >
        <Link
          to={`/vocabularies/${id}`}
          className="h-full p-3 w-full absolute top-1 left-1"
        >
          <div className="relative flex justify-between items-center">
            <h3 className="font-bold">{title}</h3>
            <VocabularyListCardDropdownMenu
              vocabularyListId={id}
              vocabularyListTitle={title}
            />
          </div>
          <div className="text-sm text-slate-500 mb-3">{formattedDate}</div>
          <div className="text-sm">{numOfVocabularies} 단어</div>
        </Link>
        <Link
          to={`/?page=1&perPage=${perPage}&category=${category.id}`}
          className="hover:text-blue-500 absolute bottom-1 p-3 left-1"
        >
          {category.name}
        </Link>
      </Card>
    </>
  );
};
