import { useState } from "react";
import { Outlet } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const MainLayout: React.FC = ({ children }) => {
  const headerHeight = 60;
  const sidebarWidth = 200;
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const handleSidebarButton = () => {
    setShowSidebar((prev) => !prev);
  };

  return (
    <>
      <Header
        height={headerHeight}
        handleSidebarButton={handleSidebarButton}
        showSidebarOnMobile={showSidebar}
      />
      <main className="container mx-auto">
        <Sidebar width={sidebarWidth} show={showSidebar} />
        <section className={`ml-0 md:ml-[${sidebarWidth}px]`}>
          <Outlet />
        </section>
      </main>
    </>
  );
};
