import { useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useToast } from "../../toast/hooks/useToast";
import { AddCreateVocabularyListCardButton } from "./AddCreateVocabularyListCardButton";
import { CreateVocabularyCard } from "./CreateVocabularyCard";
import { CreateVocabularyListFormDto } from "./CreateVocabularyListTemplate";

export const CreateVocabularyCardList: React.FC = () => {
  const toast = useToast();
  const { control } = useFormContext<CreateVocabularyListFormDto>();
  const {
    fields: vocabularies,
    remove,
    append,
  } = useFieldArray({
    control,
    shouldUnregister: true,
    name: "vocabularies",
  });

  const removeCardHandler = useCallback(
    (index: number) => {
      if (vocabularies.length <= 1) {
        toast({
          type: "ERROR",
          desc: "단어장에는 최소 1개 이상의 단어가 있어야 합니다.",
        });
      } else {
        remove(index);
      }
    },
    [remove, vocabularies, toast]
  );
  const appendCardHandler = useCallback(() => {
    append(
      {
        english: "",
        korean: "",
        examples: [],
      },
      {
        shouldFocus: true,
      }
    );
  }, [append]);

  return (
    <>
      {vocabularies.map((vocabulary, index) => (
        <CreateVocabularyCard
          key={vocabulary.id}
          index={index}
          onRemove={removeCardHandler}
        />
      ))}
      <AddCreateVocabularyListCardButton onAppend={appendCardHandler} />
    </>
  );
};
