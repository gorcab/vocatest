type AddCreateVocabularyListCardButtonProps = {
  onAppend: () => void;
};

export const AddCreateVocabularyListCardButton: React.FC<AddCreateVocabularyListCardButtonProps> =
  ({ onAppend }) => {
    return (
      <button
        className="w-full bg-white text-center p-5 text-gray-500 hover:text-blue-500 rounded-md shadow-sm"
        type="button"
        onClick={onAppend}
      >
        단어 추가
      </button>
    );
  };
