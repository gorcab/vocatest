import { useReducer } from "react";
import {
  vocabularyListReducer,
  WrongVocabulary,
  Vocabulary,
  initializeRestVocabularies,
} from "../reducer/vocabularyListReducer";
import { VocabularyProblemCard } from "./VocabularyProblemCard";
import { VocabularyCardChangeButtons } from "./VocabularyCardChangeButtons";
import { DetailedVocabularyListDto } from "features/api/types";
import { MainHeader } from "features/common/components/MainHeader";
import { Separator } from "features/common/components/Separator";
import { FlipProvider } from "features/common/components/FlipCard/FlipProvider";
import { Button } from "features/common/components/Button";

type VocabularyListTemplateProps = {
  vocabularyList: DetailedVocabularyListDto;
};

export const VocabularyProblemListTemplate: React.FC<VocabularyListTemplateProps> =
  ({ vocabularyList }) => {
    const [state, dispatch] = useReducer(
      vocabularyListReducer,
      {
        nextVocabularySet: "REST",
        initialVocabularies: vocabularyList.vocabularies,
        restVocabularies: [],
        wrongVocabularies: [],
      },
      (initialState) => {
        const restVocabularies = initializeRestVocabularies(
          initialState.initialVocabularies
        );
        return { ...initialState, restVocabularies };
      }
    );
    const { nextVocabularySet, restVocabularies, wrongVocabularies } = state;

    const currentVocabulary: Vocabulary | WrongVocabulary | null =
      nextVocabularySet === "REST"
        ? restVocabularies[0]
        : nextVocabularySet === "WRONG"
        ? wrongVocabularies[0]
        : null;

    const skipVocabulary = () => {
      if (currentVocabulary) {
        dispatch({ type: "RIGHT_VOCABULARY", vocabulary: currentVocabulary });
      }
    };

    const reviewVocabulary = () => {
      if (currentVocabulary) {
        dispatch({ type: "WRONG_VOCABULARY", vocabulary: currentVocabulary });
      }
    };

    const resetVocabularies = () => {
      dispatch({ type: "RESET" });
    };

    return (
      <>
        <MainHeader title={vocabularyList.title}>
          <Separator className="my-1" />
          <div role="status" className="flex justify-end text-gray-700 text-sm">
            남은 단어 수: {restVocabularies.length + wrongVocabularies.length} /{" "}
            {vocabularyList.vocabularies.length}
          </div>
        </MainHeader>
        <div className="w-full md:w-9/12 md:max-w-sm h-[70vh] md:m-auto overflow-hidden relative flex flex-col justify-center items-center">
          {currentVocabulary ? (
            <FlipProvider>
              <VocabularyProblemCard vocabulary={currentVocabulary} />
              <VocabularyCardChangeButtons
                reviewVocabulary={reviewVocabulary}
                skipVocabulary={skipVocabulary}
              />
            </FlipProvider>
          ) : (
            <div>
              <div role="status" className="mb-2 text-xl font-bold">
                모든 단어를 학습했습니다!
              </div>
              <Button type="button" onClick={resetVocabularies}>
                재학습하기
              </Button>
            </div>
          )}
        </div>
      </>
    );
  };
