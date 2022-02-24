import { InputErrorMessage } from "features/common/components/InputErrorMessage";
import { Tooltip } from "features/common/components/Tooltip/Tooltip";
import { useFormContext } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import { VocabularyListFormDto } from "./VocabularyListForm";

type ExampleFieldProps = {
  vocabularyIndex: number;
  exampleIndex: number;
  onRemove: (index: number) => void;
};

export const ExampleFormField: React.FC<ExampleFieldProps> = ({
  exampleIndex,
  onRemove,
  vocabularyIndex,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<VocabularyListFormDto>();

  const onRemoveHandler = () => onRemove(exampleIndex);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 relative px-4 py-3 border-t border-dotted">
      <div className="flex flex-col mb-5">
        <label
          className="text-sm text-gray-700 pb-2"
          htmlFor={`vocabularies.${vocabularyIndex}.examples.${exampleIndex}.sentence`}
        >
          예문 {exampleIndex + 1}
        </label>
        <input
          type="text"
          className="bg-transparent border-b border-slate-400 focus:border-blue-500 outline-none"
          id={`vocabularies.${vocabularyIndex}.examples.${exampleIndex}.sentence`}
          {...register(
            `vocabularies.${vocabularyIndex}.examples.${exampleIndex}.sentence` as const,
            {
              required: "예문을 입력해주세요.",
            }
          )}
        />
        {errors.vocabularies &&
          errors.vocabularies[vocabularyIndex] &&
          errors.vocabularies[vocabularyIndex].examples &&
          errors.vocabularies[vocabularyIndex].examples?.[exampleIndex] &&
          errors.vocabularies[vocabularyIndex].examples?.[exampleIndex]
            .sentence && (
            <InputErrorMessage as="span" style={{ marginTop: "0.3rem" }}>
              {
                errors.vocabularies[vocabularyIndex].examples?.[exampleIndex]
                  ?.sentence?.message
              }
            </InputErrorMessage>
          )}
      </div>
      <div className="grid grid-cols-2">
        <div className="flex flex-col col-span-2">
          <label
            className="text-sm text-gray-700 pb-2"
            htmlFor={`vocabularies.${vocabularyIndex}.examples.${exampleIndex}.translation`}
          >
            해석 {exampleIndex + 1}
          </label>
          <input
            type="text"
            className="bg-transparent border-b border-slate-400 focus:border-blue-500 outline-none"
            id={`vocabularies.${vocabularyIndex}.examples.${exampleIndex}.translation`}
            {...register(
              `vocabularies.${vocabularyIndex}.examples.${exampleIndex}.translation` as const,
              {
                required: "예문에 대한 해석을 입력해주세요.",
              }
            )}
          />
          {errors.vocabularies &&
          errors.vocabularies[vocabularyIndex] &&
          errors.vocabularies[vocabularyIndex].examples &&
          errors.vocabularies[vocabularyIndex].examples?.[exampleIndex] &&
          errors.vocabularies[vocabularyIndex].examples?.[exampleIndex]
            .translation ? (
            <InputErrorMessage as="span" style={{ marginTop: "0.3rem" }}>
              {
                errors.vocabularies[vocabularyIndex].examples?.[exampleIndex]
                  ?.translation?.message
              }
            </InputErrorMessage>
          ) : null}
          <Tooltip title="예문 삭제">
            <button
              type="button"
              onClick={onRemoveHandler}
              className="col-auto absolute top-3 right-4"
            >
              <FaTimes />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
