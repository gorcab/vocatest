import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { Button } from "../features/common/components/Button";
import { VocabularyListSection } from "../features/common/components/VocabularyListSection";

export const MainPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  let title = searchParams.get("title") || undefined;
  const navigateToCreateVocabularyList = () => navigate("/create-vocabulary");

  const sectionTitle = title ? `"${title}"에 대한 검색 결과` : "전체 보기";

  return (
    <div className="mb-5 pt-10 px-10 md:px-0 md:pl-10">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl pb-2 text-blue-600">
          {sectionTitle}
        </h1>
        <Button
          type="button"
          onClick={navigateToCreateVocabularyList}
          className="!w-auto px-2"
        >
          단어장 생성
        </Button>
      </div>
      <VocabularyListSection vocabularyListTitle={title} />
    </div>
  );
};
