import React from "react";
import { Navigate } from "react-router-dom";
import { useSearchUrl } from "../../common/hooks/useSearchUrl";
import { getVocabularyListSearchUrl } from "../../common/utils/helper";
import { VocabularyListCardsTemplate } from "./VocabularyListCardsTemplate";

export const VocabularyListSection: React.FC = () => {
  const { pagedVocabularyListsRequest } = useSearchUrl();
  const {
    page,
    perPage,
    title,
    category: categoryId,
  } = pagedVocabularyListsRequest;

  if (!page || !perPage) {
    const { pathname, search } = getVocabularyListSearchUrl({
      page,
      perPage,
      categoryId,
      title,
    });

    return (
      <Navigate
        to={{
          pathname,
          search,
        }}
        replace={true}
      />
    );
  }

  return (
    <VocabularyListCardsTemplate
      pagedVocabularyListsRequest={pagedVocabularyListsRequest}
    />
  );
};
