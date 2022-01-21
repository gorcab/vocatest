import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { VocabularyListSection } from "../../vocabulary/components/VocabularyListSection";
import { Button } from "./Button";
import { MainContainer } from "./MainContainer";
import { MainHeader } from "./MainHeader";

export const MainPageTemplate: React.FC = () => {
  const [searchParams] = useSearchParams();
  let title = searchParams.get("title");
  title = title ? `"${title}"에 대한 검색 결과` : "전체 보기";
  const navigate = useNavigate();
  const navigateToCreateVocabularyList = () => navigate("/create-vocabulary");

  return (
    <MainContainer>
      <MainHeader
        title={title}
        rightElement={
          <Button
            type="button"
            onClick={navigateToCreateVocabularyList}
            className="!w-auto px-2"
          >
            단어장 생성
          </Button>
        }
      />
      <VocabularyListSection />
    </MainContainer>
  );
};
