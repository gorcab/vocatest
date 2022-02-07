import { createContext, useState } from "react";
import { Outlet } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const CloseSidebarContext =
  createContext<React.Dispatch<React.SetStateAction<boolean>> | null>(null);

export const MainLayout: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const handleSidebarButton = () => {
    setShowSidebar((prev) => !prev);
  };

  return (
    <>
      <Header
        handleSidebarButton={handleSidebarButton}
        showSidebarOnMobile={showSidebar}
      />
      <main className="md:container w-full lg:flex md:w-auto md:mx-auto">
        <CloseSidebarContext.Provider value={setShowSidebar}>
          <Sidebar show={showSidebar} />
        </CloseSidebarContext.Provider>
        <section className={`mt-[60px] ml-0 lg:grow`}>
          <Outlet />
        </section>
      </main>
    </>
  );
};
