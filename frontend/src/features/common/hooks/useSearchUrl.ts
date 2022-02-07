import { useSearchParams } from "react-router-dom";
import { PagedVocabularyListsRequest } from "../../api/types";
import { DEFAULT_PER_PAGE } from "../utils/constants";

export const useSearchUrl = () => {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page"));
  const perPage = Number(searchParams.get("perPage")) || DEFAULT_PER_PAGE;
  const title = searchParams.get("title");
  const category = Number(searchParams.get("category")) || undefined;

  const pagedVocabularyListsRequest: PagedVocabularyListsRequest = {
    page: page <= 0 ? NaN : page,
    perPage: perPage <= 0 ? NaN : perPage,
    ...(title && { title }),
    ...(category && { categoryId: category }),
  };

  return { pagedVocabularyListsRequest };
};
