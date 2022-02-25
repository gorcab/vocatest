import React from "react";
import { ErrorFallbackUI } from "features/common/components/ErrorFallbackUI";
import { Pagination } from "features/common/components/Pagination";
import { SkeletonCardList } from "features/common/components/SkeletonCardList";
import { useVocabularyListsWithPagination } from "features/common/hooks/useVocabularyListsWithPagination";
import { is4XXError, is5XXError } from "features/common/utils/helper";
import { HttpError } from "features/common/utils/HttpError";
import { VocabularyListCard } from "./VocabularyListCard";

type VocabularyListCardListProps = {
  page: number;
  perPage: number;
  title?: string;
  categoryId?: number;
};

export const VocabularyListCardListSection: React.FC<VocabularyListCardListProps> =
  ({ page, perPage, title, categoryId }) => {
    const {
      isFetching,
      vocabularyLists,
      queryError,
      pageHandler,
      refetchHandler,
    } = useVocabularyListsWithPagination({
      page,
      perPage,
      title,
      categoryId,
    });

    if (isFetching) {
      return <SkeletonCardList length={perPage} />;
    }

    if (queryError) {
      if (is4XXError(queryError)) {
        return (
          <ErrorFallbackUI
            type="reset"
            wrapperClassName="h-96 flex flex-col justify-center items-center"
            message="단어장 조회에 실패했습니다."
            onReset={refetchHandler}
            resetButtonText="재요청"
          />
        );
      } else if (is5XXError(queryError)) {
        throw new HttpError(queryError.status);
      }

      throw queryError;
    }

    if (vocabularyLists && vocabularyLists.data.length > 0) {
      return (
        <>
          <ul
            aria-label="단어장 목록"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
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
            <div className="flex flex-row-reverse mb-10">
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

    return null;
  };
