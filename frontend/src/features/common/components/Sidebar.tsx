import { useCallback, useState } from "react";
import { CreateCategoryFormModal } from "features/category/create/components/CreateCategoryFormModal";
import { CategoryLinkList } from "features/category/show/components/CategoryLinkList";
import { Button } from "./Button";

type SidebarProps = {
  show: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ show }) => {
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
        className={`w-full lg:w-[200px] overflow-y-auto transform-gpu duration-100 lg:transform-none z-50 ${
          show
            ? `translate-x-[0] visible`
            : `-translate-x-full invisible lg:visible`
        } h-screen border-x px-2 pt-10 lg:pt-[calc(60px+2.5rem)] fixed left-0 lg:sticky lg:top-0 lg:h-[calc(100vh-60px)] bg-slate-100`}
      >
        <Button type="button" onClick={openCreateCategoryFormModal}>
          카테고리 생성
        </Button>
        <CategoryLinkList />
      </aside>
      <CreateCategoryFormModal
        isOpen={isModalVisible}
        modalCloseHandler={closeCreateCategoryFormModal}
      />
    </>
  );
};
