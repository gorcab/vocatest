import { CategoryLinkList } from "../../category/components/CategoryLinkList";
import { Button } from "./Button";
import { CreateCategoryFormModal } from "../../category/components/CreateCategoryFormModal";
import { useCallback, useState } from "react";

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
        className={`w-full md:w-[200px] transform-gpu duration-100 md:transform-none z-50 ${
          show ? `translate-x-[0]` : `-translate-x-full`
        } h-screen border-x px-2 pt-10 fixed bg-slate-100`}
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
