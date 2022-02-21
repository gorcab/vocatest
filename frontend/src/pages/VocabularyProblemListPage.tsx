import { Navigate, useParams } from "react-router";
import { useVocabularyListQuery } from "../features/api/slice";
import { ErrorFallbackUI } from "../features/common/components/ErrorFallbackUI";
import { is4XXError, is5XXError } from "../features/common/utils/helper";
import { HttpError } from "../features/common/utils/HttpError";
import { VocabularyProblemListSkeletonTemplate } from "../features/vocabulary/study/components/VocabularyProblemListSkeletonTemplate";
import { VocabularyProblemListTemplate } from "../features/vocabulary/study/components/VocabularyProblemListTemplate";

export const VocabularyProblemListPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const {
    isFetching,
    isError,
    error,
    data: vocabularyList,
    refetch,
  } = useVocabularyListQuery(id);

  if (isFetching) {
    return <VocabularyProblemListSkeletonTemplate />;
  }

  if (isError) {
    if (is4XXError(error)) {
      if (error.status === 403) {
        throw new HttpError(403);
      } else {
        return (
          <ErrorFallbackUI
            type="reset"
            message={error.data.message}
            wrapperClassName="h-[70vh] flex flex-col justify-center items-center"
            onReset={() => refetch()}
            resetButtonText="재요청"
          />
        );
      }
    } else if (is5XXError(error)) {
      throw new HttpError(error.status);
    }
    throw error;
  }

  if (vocabularyList) {
    return <VocabularyProblemListTemplate vocabularyList={vocabularyList} />;
  }

  return <Navigate to="/" />;
};
