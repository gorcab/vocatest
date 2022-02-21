import { Navigate } from "react-router-dom";
import { useSearchUrl } from "../features/common/hooks/useSearchUrl";
import { getVocabularyListSearchUrl } from "../features/common/utils/helper";
import { CategoryPageTemplate } from "../features/vocabulary/show/components/CategoryPageTemplate";
import { MainPageTemplate } from "../features/vocabulary/show/components/MainPageTemplate";

export const MainPage: React.FC = () => {
  const {
    pagedVocabularyListsRequest: { page, perPage, categoryId, title },
  } = useSearchUrl();

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

  if (categoryId) {
    return (
      <CategoryPageTemplate
        page={page}
        perPage={perPage}
        categoryId={categoryId}
        title={title}
      />
    );
  }

  return <MainPageTemplate page={page} perPage={perPage} title={title} />;
};
