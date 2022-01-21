import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  useDeleteCategoryMutation,
  useVocabularyListsQuery,
} from "../../api/slice";
import { PagedVocabularyListsRequest } from "../../api/types";

export const useVocabularyListsWithPagination = (
  pagedVocabularyListsRequest: PagedVocabularyListsRequest
) => {
  const { page, perPage, title, category } = pagedVocabularyListsRequest;
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
      if (category) {
        url += `&category=${category}`;
      }
      navigate(url);

      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [location.pathname, navigate, title, perPage, category]
  );
  const refetchHandler = () => refetch();

  return {
    page,
    perPage,
    isFetching,
    vocabularyLists,
    isError,
    queryError,
    pageHandler,
    refetchHandler,
  };
};
