import { useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import { InputErrorMessage } from "../../common/components/InputErrorMessage";
import { Tooltip } from "../../common/components/Tooltip";
import { CreateExampleFields } from "./CreateExampleFields";
import { CreateVocabularyListFormDto } from "./CreateVocabularyListTemplate";

type CreateVocabularyCardProps = {
  index: number;
  onRemove: (index: number) => void;
};

export const CreateVocabularyCard: React.FC<CreateVocabularyCardProps> = ({
  index,
  onRemove,
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateVocabularyListFormDto>();
  const {
    append,
    remove,
    fields: examples,
  } = useFieldArray({
    shouldUnregister: true,
    control,
    name: `vocabularies.${index}.examples` as const,
  });

  const removeVocabularyHandler = () => onRemove(index);
  const appendExampleHandler = () => {
    append({
      sentence: "",
      translation: "",
    });
  };
  const removeExampleHandler = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove]
  );

  return (
    <div className="w-full bg-white mb-5 rounded-md shadow-md relative">
      <div className="flex justify-between px-4 py-2 border-b border-stone-300">
        <div className="text-sm text-gray-700">{index + 1}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 py-3 px-4">
        <div className="flex flex-col mb-5 lg:mb-0">
          <label
            htmlFor={`vocabularies.${index}.english`}
            className="text-sm text-gray-700 pb-2"
          >
            단어
          </label>
          <input
            className="bg-transparent border-b border-slate-400 focus:border-blue-500 outline-none"
            type="text"
            id={`vocabularies.${index}.english`}
            {...register(`vocabularies.${index}.english` as const, {
              required: "등록할 단어를 입력해주세요.",
            })}
          />
          {errors.vocabularies && errors.vocabularies[index]?.english ? (
            <InputErrorMessage as="span" style={{ marginTop: "0.3rem" }}>
              {errors.vocabularies[index].english?.message}
            </InputErrorMessage>
          ) : null}
        </div>
        <div className="flex flex-col mb-5">
          <label
            htmlFor={`vocabularies.${index}.korean`}
            className="text-sm text-gray-700 pb-2"
          >
            뜻
          </label>
          <input
            className="bg-transparent border-b border-slate-400 focus:border-blue-500 outline-none"
            type="text"
            id={`vocabularies.${index}.korean`}
            {...register(`vocabularies.${index}.korean` as const, {
              required: "단어의 뜻을 입력해주세요.",
            })}
          />
          {errors.vocabularies && errors.vocabularies[index]?.korean ? (
            <InputErrorMessage as="span" style={{ marginTop: "0.3rem" }}>
              {errors.vocabularies[index].korean?.message}
            </InputErrorMessage>
          ) : null}
        </div>
      </div>
      {examples.length > 0 &&
        examples.map((_, exampleIndex) => (
          <CreateExampleFields
            vocabularyIndex={index}
            exampleIndex={exampleIndex}
            key={exampleIndex}
            onRemove={removeExampleHandler}
          />
        ))}
      <div className="absolute top-2 right-4">
        <Tooltip title="예문 추가">
          <button type="button" onClick={appendExampleHandler} className="mr-3">
            <MdPostAdd aria-hidden={true} />
          </button>
        </Tooltip>
        <Tooltip title="단어 삭제">
          <button type="button" onClick={removeVocabularyHandler}>
            <FaTimes aria-hidden={true} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
