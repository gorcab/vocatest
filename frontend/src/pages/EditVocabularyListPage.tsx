import { useCategoryQuery, useVocabularyListQuery } from "features/api/slice";
import { ErrorFallbackUI } from "features/common/components/ErrorFallbackUI";
import { MainHeader } from "features/common/components/MainHeader";
import { is4XXError, is5XXError } from "features/common/utils/helper";
import { HttpError } from "features/common/utils/HttpError";
import { CreateVocabularySkeletonTemplate } from "features/vocabulary/create/components/CreateVocabularySkeletonTemplate";
import { EditVocabularyListTemplate } from "features/vocabulary/edit/components/EditVocabularyListTemplate";
import { Navigate, useParams } from "react-router";

export const EditVocabularyListPage: React.FC = () => {
  console.log("EditVocabularyListPage rendered");
  const title = "단어장 수정";
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const {
    isLoading: isVocabularyListLoading,
    data: vocabularyList,
    refetch: refetchVocabularyList,
    error: vocabularyListQueryError,
  } = useVocabularyListQuery(id);
  const {
    data: categories,
    isFetching: isCategoriesFetching,
    error: categoriesQueryError,
    refetch: refetchCategories,
  } = useCategoryQuery();

  if (isVocabularyListLoading || isCategoriesFetching) {
    return (
      <>
        <MainHeader title={title} />
        <CreateVocabularySkeletonTemplate />
      </>
    );
  }

  if (vocabularyListQueryError) {
    if (is4XXError(vocabularyListQueryError)) {
      if (vocabularyListQueryError.status === 403) {
        throw new HttpError(vocabularyListQueryError.status);
      }
      return (
        <>
          <ErrorFallbackUI
            wrapperClassName="h-full flex flex-col items-center justify-center"
            type="reset"
            message="단어장을 불러오는데 실패했습니다."
            onReset={() => refetchVocabularyList()}
            resetButtonText="재요청"
          />
        </>
      );
    } else if (is5XXError(vocabularyListQueryError)) {
      throw new HttpError(vocabularyListQueryError.status);
    }
    throw vocabularyListQueryError;
  }

  if (categoriesQueryError) {
    if (is4XXError(categoriesQueryError)) {
      return (
        <>
          <ErrorFallbackUI
            wrapperClassName="h-full flex flex-col items-center justify-center"
            type="reset"
            message={
              "단어장 수정을 위해서는 카테고리 조회가 필요합니다. 카테고리 조회를 재요청해주세요."
            }
            onReset={() => refetchCategories()}
            resetButtonText="재요청"
          />
        </>
      );
    } else if (is5XXError(categoriesQueryError)) {
      throw new HttpError(categoriesQueryError.status);
    }
    throw categoriesQueryError;
  }

  if (vocabularyList && categories) {
    return (
      <>
        <MainHeader title={title} />
        <EditVocabularyListTemplate
          vocabularyList={vocabularyList}
          categories={categories}
        />
      </>
    );
  }

  return <Navigate to="/" />;
};
