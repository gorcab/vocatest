import { CategoryDto } from "../../api/types";
import { BasicForm } from "../../common/components/BasicForm";
import { InputErrorMessage } from "../../common/components/InputErrorMessage";
import { InputGroup } from "../../common/components/InputGroup";
import { Label } from "../../common/components/Label";
import { Modal } from "../../common/components/Modal";
import { Spinner } from "../../common/components/Spinner";
import { useEditCategoryForm } from "../hooks/useEditCategoryForm";

type EditCategoryFormModalProps = {
  isOpen: boolean;
  category: CategoryDto;
  modalCloseHandler: () => void;
};

export const EditCategoryFormModal: React.FC<EditCategoryFormModalProps> = ({
  isOpen,
  category,
  modalCloseHandler,
}) => {
  const {
    categoryNameFieldRef,
    submitHandler,
    formErrors,
    isEditLoading,
    registerNameRef,
    registeredNameResult: { ref, ...rest },
  } = useEditCategoryForm(isOpen, category, modalCloseHandler);

  return (
    <Modal
      onClose={modalCloseHandler}
      isOpen={isOpen}
      title="카테고리 수정하기"
      initialFocusRef={categoryNameFieldRef}
      backgroundColorclassName="bg-white"
    >
      <BasicForm onSubmit={submitHandler}>
        <Label label="카테고리명" name="name" />
        <InputGroup>
          <input
            type="text"
            id="name"
            ref={registerNameRef}
            className="w-full border rounded mb-2 p-1 flex items-center"
            {...rest}
          />
          {formErrors.name && (
            <InputErrorMessage as="div">
              {formErrors.name.message}
            </InputErrorMessage>
          )}
        </InputGroup>
        <div className="flex justify-end items-center">
          <button
            type="submit"
            disabled={isEditLoading}
            className="bg-blue-500 disabled:bg-blue-500/80 hover:bg-blue-500/80 py-1 px-3 w-20 flex justify-center items-center text-white rounded focus:outline focus:outline-offset-2 focus:outline-2"
          >
            {isEditLoading ? (
              <Spinner thickness={2} gap={2} color="white" size={25} />
            ) : (
              "수정하기"
            )}
          </button>
        </div>
      </BasicForm>
    </Modal>
  );
};
