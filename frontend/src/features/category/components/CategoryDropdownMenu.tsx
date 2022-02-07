import { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { CategoryDto } from "../../api/types";
import { DropdownMenu } from "../../common/components/Dropdown/DropdownMenu";
import { EditCategoryFormModal } from "./EditCategoryFormModal";
import { motion } from "framer-motion";
import { visibleVariant } from "../../common/utils/animation-variants";
import { DeleteCategoryFormModal } from "./DeleteCategoryFormModal";
import { DropdownMenuButton } from "../../common/components/Dropdown/DropdownMenuButton";
import { DropdownMenuList } from "../../common/components/Dropdown/DropdownMenuList";
import { DropdownMenuItem } from "../../common/components/Dropdown/DropdownMenuItem";

type CategoryDropdownProps = {
  category: CategoryDto;
};
export const CategoryDropdownMenu: React.FC<CategoryDropdownProps> = ({
  category,
}) => {
  const [modalOpenState, setFormOpenState] =
    useState<"edit" | "delete" | null>(null);
  const modalCloseHandler = () => setFormOpenState(null);
  const openEditCategoryFormModal = () => setFormOpenState("edit");
  const openDeleteCategoryFormModal = () => setFormOpenState("delete");
  return (
    <>
      <DropdownMenu>
        <DropdownMenuButton className="flex justify-center items-center text-slate-500 hover:text-blue-500">
          <FaEllipsisV className="w-[25px] h-[25px] p-0.5" />
          <span className="sr-only">카테고리 관련 메뉴</span>
        </DropdownMenuButton>
        <DropdownMenuList
          as={motion.div}
          variants={visibleVariant}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <DropdownMenuItem as="button" onClick={openEditCategoryFormModal}>
            카테고리 수정
          </DropdownMenuItem>
          <DropdownMenuItem as="button" onClick={openDeleteCategoryFormModal}>
            카테고리 삭제
          </DropdownMenuItem>
        </DropdownMenuList>
      </DropdownMenu>
      <EditCategoryFormModal
        isOpen={modalOpenState === "edit"}
        modalCloseHandler={modalCloseHandler}
        category={category}
      />
      <DeleteCategoryFormModal
        isOpen={modalOpenState === "delete"}
        onClose={modalCloseHandler}
        category={category}
      />
    </>
  );
};
