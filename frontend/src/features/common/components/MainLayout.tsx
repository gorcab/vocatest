import { useState } from "react";
import { Outlet } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

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
      <main className="md:container w-full md:w-auto md:mx-auto">
        <Sidebar show={showSidebar} />
        <section className={`ml-0 md:ml-[200px]`}>
          <Outlet />
        </section>
      </main>
    </>
  );
};
