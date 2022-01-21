import { motion } from "framer-motion";
import { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { DropdownMenu } from "../../common/components/DropdownMenu";
import { DropdownMenuButton } from "../../common/components/DropdownMenuButton";
import { DropdownMenuItem } from "../../common/components/DropdownMenuItem";
import { DropdownMenuList } from "../../common/components/DropdownMenuList";
import { visibleVariant } from "../../common/utils/animation-variants";
import { DeleteVocabularyListModal } from "./DeleteVocabularyListModal";

type VocabularyListCardDropdownMenuProps = {
  vocabularyListId: number;
  vocabularyListTitle: string;
};

export const VocabularyListCardDropdownMenu: React.FC<VocabularyListCardDropdownMenuProps> =
  ({ vocabularyListId, vocabularyListTitle }) => {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const openModalHandler: React.MouseEventHandler<HTMLButtonElement> = (
      event
    ) => {
      event.preventDefault();
      event.stopPropagation();
      setShowDeleteModal(true);
    };

    const closeModalHandler = () => {
      setShowDeleteModal(false);
    };

    const navigateToEditVocabularyListPage: React.MouseEventHandler<HTMLButtonElement> =
      (event) => {
        event.preventDefault();
        navigate(`/edit-vocabulary/${vocabularyListId}`);
      };
    return (
      <>
        <DropdownMenu>
          <DropdownMenuButton className="p-2 flex justify-center items-center text-slate-500 hover:text-blue-500">
            <FaEllipsisV />
            <span className="sr-only">단어장 관련 메뉴</span>
          </DropdownMenuButton>
          <DropdownMenuList
            as={motion.div}
            variants={visibleVariant}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <DropdownMenuItem as="button" onClick={openModalHandler}>
              단어장 삭제
            </DropdownMenuItem>
            <DropdownMenuItem
              as="button"
              onClick={navigateToEditVocabularyListPage}
            >
              단어장 수정
            </DropdownMenuItem>
          </DropdownMenuList>
        </DropdownMenu>
        <DeleteVocabularyListModal
          title={vocabularyListTitle}
          vocabularyListId={vocabularyListId}
          isOpen={showDeleteModal}
          onClose={closeModalHandler}
        />
      </>
    );
  };
