import { useEffect, useRef } from "react";
import { useDeleteVocabularyListMutation } from "../../api/slice";
import { Modal } from "../../common/components/Modal";
import { Spinner } from "../../common/components/Spinner";
import { useToast } from "../../toast/hooks/useToast";

type DeleteVocabularyListModalProps = {
  isOpen: boolean;
  title: string;
  vocabularyListId: number;
  onClose: () => void;
};

export const DeleteVocabularyListModal: React.FC<DeleteVocabularyListModalProps> =
  ({ isOpen, title, vocabularyListId, onClose }) => {
    const toast = useToast();
    const [deleteVocabularyList, { isLoading, error, isSuccess, reset }] =
      useDeleteVocabularyListMutation();
    const deleteButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (deleteButtonRef.current && isOpen) {
        deleteButtonRef.current.focus();
      }
    }, [isOpen]);

    useEffect(() => {
      if (isSuccess) {
        onClose();
      } else if (error) {
        reset();
        toast({
          type: "ERROR",
          desc: "단어장 삭제에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      }
    }, [isSuccess, reset, onClose, error, toast]);

    const deleteHandler = () => {
      deleteVocabularyList(vocabularyListId);
    };

    return (
      <Modal
        onClose={onClose}
        isOpen={isOpen}
        initialFocusRef={deleteButtonRef}
        backgroundColorclassName="bg-white"
        title="단어장 삭제"
      >
        <p className="mb-5">{title} 단어장을 삭제하시겠습니까?</p>
        <div className="flex flex-row-reverse text-white">
          <button
            type="button"
            disabled={isLoading}
            ref={deleteButtonRef}
            onClick={deleteHandler}
            className={`ml-5 rounded-sm bg-red-500 hover:bg-red-500/80 disabled:bg-red-500/80 outline-red-500 focus:outline focus:outline-offset-2 focus:outline-2 py-1 px-3 w-20 flex justify-center`}
          >
            {isLoading ? (
              <Spinner thickness={2} gap={2} color="White" size={25} />
            ) : (
              "삭제하기"
            )}
          </button>
          <button
            type="button"
            className="rounded-sm bg-gray-400 hover:bg-gray-400/80 outline-gray-400 focus:outline focus:outline-offset-2 focus:outline-2 py-1 px-3 w-20 flex justify-center"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </Modal>
    );
  };
