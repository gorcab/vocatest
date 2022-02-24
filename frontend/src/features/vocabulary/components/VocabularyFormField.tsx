import { InputErrorMessage } from "features/common/components/InputErrorMessage";
import { Tooltip } from "features/common/components/Tooltip/Tooltip";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import { ExampleFormField } from "./ExampleFormField";
import { VocabularyListFormDto } from "./VocabularyListForm";

type VocabularyFormFieldProps = {
  index: number;
  onRemove: (index: number) => void;
};

export const VocabularyFormField: React.FC<VocabularyFormFieldProps> = ({
  index: vocabularyIndex,
  onRemove,
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<VocabularyListFormDto>();
  const {
    fields: exampleFields,
    append,
    remove,
  } = useFieldArray({
    shouldUnregister: true,
    control,
    name: `vocabularies.${vocabularyIndex}.examples` as const,
  });

  const onRemoveHandler = () => onRemove(vocabularyIndex);
  const appendExampleFieldHandler = () =>
    append({
      sentence: "",
      translation: "",
    });
  const removeExampleFieldHandler = (index: number) => remove(index);

  return (
    <div className="w-full bg-white mb-5 rounded-md shadow-md relative">
      <div className="flex justify-between px-4 py-2 border-b border-stone-300">
        <div className="text-sm text-gray-700">{vocabularyIndex + 1}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 py-3 px-4">
        <div className="flex flex-col mb-5 lg:mb-0">
          <label
            htmlFor={`vocabularies.${vocabularyIndex}.english`}
            className="text-sm text-gray-700 pb-2"
          >
            단어
          </label>
          <input
            className="bg-transparent border-b border-slate-400 focus:border-blue-500 outline-none"
            type="text"
            id={`vocabularies.${vocabularyIndex}.english`}
            {...register(`vocabularies.${vocabularyIndex}.english` as const, {
              required: "등록할 단어를 입력해주세요.",
            })}
          />
          {errors.vocabularies &&
          errors.vocabularies[vocabularyIndex]?.english ? (
            <InputErrorMessage as="span" style={{ marginTop: "0.3rem" }}>
              {errors.vocabularies[vocabularyIndex].english?.message}
            </InputErrorMessage>
          ) : null}
        </div>
        <div className="flex flex-col mb-5">
          <label
            htmlFor={`vocabularies.${vocabularyIndex}.korean`}
            className="text-sm text-gray-700 pb-2"
          >
            뜻
          </label>
          <input
            className="bg-transparent border-b border-slate-400 focus:border-blue-500 outline-none"
            type="text"
            id={`vocabularies.${vocabularyIndex}.korean`}
            {...register(`vocabularies.${vocabularyIndex}.korean` as const, {
              required: "단어의 뜻을 입력해주세요.",
            })}
          />
          {errors.vocabularies &&
          errors.vocabularies[vocabularyIndex]?.korean ? (
            <InputErrorMessage as="span" style={{ marginTop: "0.3rem" }}>
              {errors.vocabularies[vocabularyIndex].korean?.message}
            </InputErrorMessage>
          ) : null}
        </div>

        <div className="absolute top-2 right-4">
          <Tooltip title="예문 추가">
            <button
              type="button"
              onClick={appendExampleFieldHandler}
              className="mr-3"
            >
              <MdPostAdd aria-hidden={true} />
            </button>
          </Tooltip>
          <Tooltip title="단어 삭제">
            <button type="button" onClick={onRemoveHandler}>
              <FaTimes aria-hidden={true} />
            </button>
          </Tooltip>
        </div>
      </div>
      {exampleFields.map((example, index) => (
        <ExampleFormField
          key={example.id}
          exampleIndex={index}
          onRemove={removeExampleFieldHandler}
          vocabularyIndex={vocabularyIndex}
        />
      ))}
    </div>
  );
};
