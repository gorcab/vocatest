import { useToast } from "features/toast/hooks/useToast";
import { Control, useFieldArray } from "react-hook-form";
import { VocabularyFormField } from "./VocabularyFormField";
import { VocabularyListFormDto } from "./VocabularyListForm";

type VocabularyFormFieldListProps = {
  control: Control<VocabularyListFormDto, object>;
};

export const VocabularyFormFieldList: React.FC<VocabularyFormFieldListProps> =
  ({ control }) => {
    const toast = useToast();
    const {
      fields: vocabularyFields,
      remove,
      append,
    } = useFieldArray({
      control,
      shouldUnregister: true,
      name: "vocabularies",
    });

    const removeVocabularyField = (index: number) => {
      if (vocabularyFields.length <= 1) {
        toast({
          type: "INFO",
          desc: "단어장에는 최소 1개 이상의 단어가 있어야 합니다.",
        });
      } else {
        remove(index);
      }
    };

    const appendVocabularyField = () => {
      append({
        english: "",
        korean: "",
        examples: [],
      });
    };

    return (
      <div>
        {vocabularyFields.map((vocabulary, index) => (
          <VocabularyFormField
            key={vocabulary.id}
            index={index}
            onRemove={removeVocabularyField}
          />
        ))}
        <button
          className="w-full bg-white text-center p-5 text-gray-500 hover:text-blue-500 rounded-md shadow-sm"
          type="button"
          onClick={appendVocabularyField}
        >
          단어 추가
        </button>
      </div>
    );
  };
