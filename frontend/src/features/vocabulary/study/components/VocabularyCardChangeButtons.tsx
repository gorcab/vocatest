import { Button } from "features/common/components/Button";
import { useFlipCard } from "features/common/components/FlipCard/context/FlipCardContext";

type VocabularyCardChangeButtonsProps = {
  skipVocabulary: () => void;
  reviewVocabulary: () => void;
};

export const VocabularyCardChangeButtons: React.FC<VocabularyCardChangeButtonsProps> =
  ({ skipVocabulary, reviewVocabulary }) => {
    const { flipCard } = useFlipCard(VocabularyCardChangeButtons.name);
    const clickRightButton = () => {
      flipCard(0);
      skipVocabulary();
    };

    const clickWrongButton = () => {
      flipCard(0);
      reviewVocabulary();
    };

    return (
      <div className="w-full mt-3 flex px-1">
        <Button type="button" className="mr-3" onClick={clickRightButton}>
          O
        </Button>
        <Button
          type="button"
          className="!bg-red-600"
          onClick={clickWrongButton}
        >
          X
        </Button>
      </div>
    );
  };
