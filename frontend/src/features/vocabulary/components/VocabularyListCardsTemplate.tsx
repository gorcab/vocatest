import { PagedVocabularyListsRequest } from "../../api/types";
import { VocabularyListCard } from "./VocabularyListCard";
import { useVocabularyListsWithPagination } from "../../common/hooks/useVocabularyListsWithPagination";
import { Pagination } from "../../common/components/Pagination";
import { SkeletonCardList } from "../../common/components/SkeletonCardList";
import { ErrorFallbackUI } from "../../common/components/ErrorFallbackUI";
import { is4XXError, is5XXError } from "../../common/utils/helper";

type VocabularyListCardsTemplateProps = {
  pagedVocabularyListsRequest: PagedVocabularyListsRequest;
};

export const VocabularyListCardsTemplate: React.FC<VocabularyListCardsTemplateProps> =
  ({ pagedVocabularyListsRequest }) => {
    const {
      page,
      perPage,
      isFetching,
      vocabularyLists,
      queryError,
      pageHandler,
      refetchHandler,
    } = useVocabularyListsWithPagination(pagedVocabularyListsRequest);

    if (isFetching) {
      return <SkeletonCardList length={perPage} />;
    }

    if (vocabularyLists && vocabularyLists.data.length > 0) {
      return (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vocabularyLists.data.map(({ id, category, ...props }) => (
              <VocabularyListCard
                key={id}
                id={id}
                category={category}
                {...props}
              />
            ))}
          </ul>
          {page <= vocabularyLists.totalPage && (
            <div className="flex flex-row-reverse">
              <Pagination
                currentPage={page}
                numOfItemsPerPage={vocabularyLists.perPage}
                totalItems={vocabularyLists.total}
                onPageChange={pageHandler}
              />
            </div>
          )}
        </>
      );
    }

    if (is4XXError(queryError) || is5XXError(queryError)) {
      return (
        <div className="h-96 flex flex-col justify-center items-center">
          <ErrorFallbackUI
            status={queryError.status}
            message={queryError.data.message || "단어장 조회에 실패했습니다."}
            onReset={refetchHandler}
          />
        </div>
      );
    }

    return null;
  };
