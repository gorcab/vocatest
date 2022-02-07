import { useNavigate } from "react-router";
import { useCategoryQuery } from "../../api/slice";
import { useToast } from "../../toast/hooks/useToast";
import { VocabularyListCardListSection } from "./VocabularyListCardListSection";
import { Button } from "../../common/components/Button";
import { MainContainer } from "../../common/components/MainContainer";
import { MainHeader } from "../../common/components/MainHeader";

type MainPageTemplateProps = {
  page: number;
  perPage: number;
  title?: string;
};

export const MainPageTemplate: React.FC<MainPageTemplateProps> = ({
  page,
  perPage,
  title,
}) => {
  const toast = useToast();
  const { data: categories, isLoading } = useCategoryQuery();

  const navigate = useNavigate();

  const createVocabularyListHandler = () => {
    if (categories && categories.length > 0) {
      navigate("/create-vocabulary");
    } else {
      toast({
        type: "ERROR",
        desc: "카테고리를 먼저 생성해주세요.",
      });
    }
  };

  return (
    <MainContainer>
      <MainHeader
        title={title ? `"${title}"에 대한 검색 결과` : "전체 보기"}
        rightElement={
          <Button
            disabled={isLoading}
            type="button"
            onClick={createVocabularyListHandler}
            className="!w-auto px-2"
          >
            단어장 생성
          </Button>
        }
      />
      <VocabularyListCardListSection
        page={page}
        perPage={perPage}
        title={title}
      />
    </MainContainer>
  );
};
