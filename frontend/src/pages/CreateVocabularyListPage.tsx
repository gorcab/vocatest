import { useCategoryQuery } from "../features/api/slice";
import { ErrorFallbackUI } from "../features/common/components/ErrorFallbackUI";
import { MainContainer } from "../features/common/components/MainContainer";
import { MainHeader } from "../features/common/components/MainHeader";
import { is4XXError, is5XXError } from "../features/common/utils/helper";
import { CreateVocabularySkeletonTemplate } from "../features/vocabulary/components/CreateVocabularySkeletonTemplate";
import { CreateVocabularyListTemplate } from "../features/vocabulary/components/CreateVocabularyListTemplate";

export const CreateVocabularyListPage: React.FC = () => {
  const {
    data: categories,
    isFetching,
    isError,
    error,
    refetch,
  } = useCategoryQuery();

  const refetchCategories = () => refetch();
  if (isFetching) {
    return (
      <MainContainer>
        <MainHeader title="단어장 생성" />
        <CreateVocabularySkeletonTemplate />
      </MainContainer>
    );
  }

  if (isError && (is4XXError(error) || is5XXError(error))) {
    return (
      <MainContainer>
        <ErrorFallbackUI
          message={error.data.message}
          onReset={refetchCategories}
        />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader title="단어장 생성" />
      <CreateVocabularyListTemplate categories={categories!} />
    </MainContainer>
  );
};
