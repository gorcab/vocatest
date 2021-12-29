import { CategoryList } from "../../category/components/CategoryList";
import { Button } from "./Button";

type SidebarProps = {
  width: number;
  show: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ width, show }) => {
  return (
    <>
      <aside
        className={`w-full md:w-[${width}px] transform-gpu duration-100 md:transform-none ${
          show ? `translate-x-[0]` : `-translate-x-full`
        } h-screen border-x px-2 py-2 fixed bg-slate-100`}
      >
        <Button type="button" onClick={() => console.log("click")}>
          카테고리 생성
        </Button>
        <CategoryList />
      </aside>
    </>
  );
};
