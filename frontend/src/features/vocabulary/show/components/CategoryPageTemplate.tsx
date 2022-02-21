import { useCategoryQuery } from "features/api/slice";
import { CategoryDropdownMenu } from "features/category/components/CategoryDropdownMenu";
import { Button } from "features/common/components/Button";
import { MainHeader } from "features/common/components/MainHeader";
import { Skeleton } from "features/common/components/Skeleton";
import { SkeletonCardList } from "features/common/components/SkeletonCardList";
import { NotFoundPage } from "pages/NotFoundPage";
import { useNavigate } from "react-router";
import { VocabularyListCardListSection } from "./VocabularyListCardListSection";

type CategoryPageTemplateProps = {
  page: number;
  perPage: number;
  categoryId: number;
  title?: string;
};

export const CategoryPageTemplate: React.FC<CategoryPageTemplateProps> = ({
  page,
  perPage,
  categoryId,
  title,
}) => {
  const navigate = useNavigate();
  const { data: categories, isFetching } = useCategoryQuery();
  const category = categories?.find((category) => category.id === categoryId);

  if (isFetching) {
    return (
      <>
        <MainHeader>
          <div className="flex justify-between h-full">
            <Skeleton width={150} height={30} color="#e7e7e7" />
          </div>
        </MainHeader>
        <SkeletonCardList length={perPage} />
        <span role="status" className="sr-only">
          데이터를 불러오는 중입니다.
        </span>
      </>
    );
  }

  if (!category) {
    return <NotFoundPage />;
  }

  const createVocabularyListHandler = () => {
    if (category) {
      navigate(`/create-vocabulary`, {
        state: {
          categoryId: category.id,
          perPage,
        },
      });
    }
  };

  return (
    <>
      <MainHeader
        title={
          title
            ? `${category.name} 카테고리 내 "${title}"에 대한 검색 결과`
            : category.name
        }
        rightElement={
          <div className="flex items-center">
            <CategoryDropdownMenu category={category} />
            <Button
              type="button"
              onClick={createVocabularyListHandler}
              className="!w-auto px-2 ml-3"
            >
              단어장 생성
            </Button>
          </div>
        }
      />
      <VocabularyListCardListSection
        page={page}
        perPage={perPage}
        categoryId={categoryId}
        title={title}
      />
    </>
  );
};
