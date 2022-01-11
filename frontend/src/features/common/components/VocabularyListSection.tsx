import React from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useVocabularyListsQuery } from "../../api/slice";
import { VocabularyListCard } from "../../vocabulary/components/VocabularyListCard";
import { Pagination } from "./Pagination";
import { DEFAULT_PER_PAGE } from "../utils/constants";
import { SkeletonCard } from "./SkeletonCard";
import { Button } from "./Button";

type VocabularyListSectionProps = {
  vocabularyListTitle?: string;
};

export const VocabularyListSection: React.FC<VocabularyListSectionProps> = ({
  vocabularyListTitle,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  let page = Number(searchParams.get("page"));
  if (page < 0) page = 1;
  let perPage = Number(searchParams.get("perPage"));
  if (perPage < 0) perPage = DEFAULT_PER_PAGE;

  const {
    data: pagedVocabularyListsDto,
    isFetching,
    isError,
    refetch,
  } = useVocabularyListsQuery({
    page,
    perPage,
    title: vocabularyListTitle,
  });

  if (!page || !perPage) {
    page = page || 1;
    perPage = perPage || DEFAULT_PER_PAGE;

    let search = `page=${page}&perPage=${perPage}`;
    if (vocabularyListTitle) {
      search += `&title=${vocabularyListTitle}`;
    }

    return (
      <Navigate
        to={{
          pathname: "/",
          search,
        }}
        replace={true}
      />
    );
  }

  const pageHandler = (nextPage: number) => {
    let search = `${location.pathname}?page=${nextPage}&perPage=${perPage}`;
    if (vocabularyListTitle) {
      search += `&title=${vocabularyListTitle}`;
    }
    navigate(search);
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  let CardComponent: JSX.Element | null = null;

  if (isFetching) {
    CardComponent = (
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: perPage }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </ul>
    );
  } else if (pagedVocabularyListsDto) {
    CardComponent = (
      <>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pagedVocabularyListsDto.data.map(({ id, category, ...props }) => (
            <VocabularyListCard
              key={id}
              id={id}
              category={category}
              {...props}
            />
          ))}
        </ul>
        {page <= pagedVocabularyListsDto.totalPage && (
          <div className="flex flex-row-reverse">
            <Pagination
              currentPage={page}
              numOfItemsPerPage={pagedVocabularyListsDto.perPage}
              totalItems={pagedVocabularyListsDto.total}
              onPageChange={pageHandler}
            />
          </div>
        )}
      </>
    );
  } else if (isError) {
    CardComponent = (
      <div className="absolute left-1/2 top-1/3 flex justify-center flex-col items-center">
        <h3 className="text-xl text-slate-500 mb-5">
          단어장 조회에 실패했습니다.
        </h3>
        <Button
          type="button"
          onClick={() => refetch()}
          className="!w-48 !bg-red-600"
        >
          재요청
        </Button>
      </div>
    );
  }

  return <>{CardComponent}</>;
};
