import { useCategoryQuery } from "../features/api/slice";
import { ErrorFallbackUI } from "../features/common/components/ErrorFallbackUI";
import { MainHeader } from "../features/common/components/MainHeader";
import { is4XXError, is5XXError } from "../features/common/utils/helper";
import { Navigate } from "react-router";
import { CreateVocabularySkeletonTemplate } from "../features/vocabulary/components/VocabularyListFormSkeletonTemplate";
import { HttpError } from "../features/common/utils/HttpError";
import { CreateVocabularyListTemplate } from "features/vocabulary/create/components/CreateVocabularyListTemplate";

export const CreateVocabularyListPage: React.FC = () => {
  const { data: categories, isFetching, error, refetch } = useCategoryQuery();
  const refetchCategories = () => refetch();

  if (isFetching) {
    return (
      <>
        <MainHeader title="단어장 생성" />
        <CreateVocabularySkeletonTemplate />
      </>
    );
  }

  if (error) {
    if (is4XXError(error)) {
      return (
        <>
          <ErrorFallbackUI
            wrapperClassName="h-full flex flex-col items-center justify-center"
            type="reset"
            message={
              "단어장 생성을 위해서는 카테고리 조회가 필요합니다. 카테고리 조회를 재요청해주세요."
            }
            onReset={refetchCategories}
            resetButtonText="재요청"
          />
        </>
      );
    } else if (is5XXError(error)) {
      throw new HttpError(error.status);
    }

    throw error;
  }

  if (categories && categories.length > 0) {
    return (
      <>
        <MainHeader title="단어장 생성" />
        <CreateVocabularyListTemplate categories={categories} />
      </>
    );
  }

  return <Navigate to="/" />;
};
