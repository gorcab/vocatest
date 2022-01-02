import { CategoryList } from "../../category/components/CategoryList";
import { Button } from "./Button";
import { CreateCategoryFormModal } from "../../category/components/CreateCategoryFormModal";
import { useCallback, useState } from "react";

type SidebarProps = {
  width: number;
  show: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ width, show }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const openCreateCategoryFormModal = () => {
    setIsModalVisible(true);
  };
  const closeCreateCategoryFormModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  return (
    <>
      <aside
        className={`w-full md:w-[${width}px] transform-gpu duration-100 md:transform-none ${
          show ? `translate-x-[0]` : `-translate-x-full`
        } h-screen border-x px-2 pt-10 fixed bg-slate-100`}
      >
        <Button type="button" onClick={openCreateCategoryFormModal}>
          카테고리 생성
        </Button>
        <CategoryList />
      </aside>
      <CreateCategoryFormModal
        isOpen={isModalVisible}
        modalCloseHandler={closeCreateCategoryFormModal}
      />
    </>
  );
};
