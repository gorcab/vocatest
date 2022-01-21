import { useSearchParams } from "react-router-dom";
import { PagedVocabularyListsRequest } from "../../api/types";

export const useSearchUrl = () => {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page"));
  const perPage = Number(searchParams.get("perPage"));
  const title = searchParams.get("title");
  const category = Number(searchParams.get("category")) || undefined;

  const pagedVocabularyListsRequest: PagedVocabularyListsRequest = {
    page: page <= 0 ? NaN : page,
    perPage: perPage <= 0 ? NaN : perPage,
    ...(title && { title }),
    ...(category && { category: category }),
  };

  return { pagedVocabularyListsRequest };
};
