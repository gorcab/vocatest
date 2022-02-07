import { useNavigate } from "react-router";
import { useCategoryQuery } from "../../api/slice";
import { Button } from "../../common/components/Button";
import { MainContainer } from "../../common/components/MainContainer";
import { MainHeader } from "../../common/components/MainHeader";
import { NotFoundPage } from "../../../pages/NotFoundPage";
import { SkeletonCardList } from "../../common/components/SkeletonCardList";
import { Skeleton } from "../../common/components/Skeleton";
import { CategoryDropdownMenu } from "../../category/components/CategoryDropdownMenu";
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
      <MainContainer>
        <MainHeader>
          <div className="flex justify-between h-full">
            <Skeleton width={150} height={30} color="#e7e7e7" />
          </div>
        </MainHeader>
        <SkeletonCardList length={perPage} />
        <span role="status" className="sr-only">
          데이터를 불러오는 중입니다.
        </span>
      </MainContainer>
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
    <MainContainer>
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
    </MainContainer>
  );
};
