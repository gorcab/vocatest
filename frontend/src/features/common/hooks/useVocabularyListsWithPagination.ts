import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  useDeleteCategoryMutation,
  useVocabularyListsQuery,
} from "features/api/slice";
import { PagedVocabularyListsRequest } from "features/api/types";

export const useVocabularyListsWithPagination = (
  pagedVocabularyListsRequest: PagedVocabularyListsRequest
) => {
  const { perPage, title, categoryId } = pagedVocabularyListsRequest;
  const navigate = useNavigate();
  const location = useLocation();
  const deleteMutation = useDeleteCategoryMutation({
    fixedCacheKey: "delete-category",
  });
  const { isSuccess: deleteCategorySuccess } = deleteMutation[1];
  const {
    isFetching,
    refetch,
    data: vocabularyLists,
    isError,
    error: queryError,
  } = useVocabularyListsQuery(pagedVocabularyListsRequest, {
    skip: deleteCategorySuccess,
  });
  const pageHandler = useCallback(
    (nextPage: number) => {
      let url = `${location.pathname}?page=${nextPage}&perPage=${perPage}`;
      if (title) {
        url += `&title=${title}`;
      }
      if (categoryId) {
        url += `&category=${categoryId}`;
      }
      navigate(url);

      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [location.pathname, navigate, title, perPage, categoryId]
  );
  const refetchHandler = () => refetch();

  return {
    isFetching,
    vocabularyLists,
    isError,
    queryError,
    pageHandler,
    refetchHandler,
  };
};
