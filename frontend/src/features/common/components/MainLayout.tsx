import { createContext, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { ErrorBoundary } from "./ErrorBoundary";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const CloseSidebarContext =
  createContext<React.Dispatch<React.SetStateAction<boolean>> | null>(null);

export const MainLayout: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const handleSidebarButton = () => {
    setShowSidebar((prev) => !prev);
  };
  const navigate = useNavigate();

  const navigateToMainPage = () => navigate("/");

  return (
    <>
      <Header
        handleSidebarButton={handleSidebarButton}
        showSidebarOnMobile={showSidebar}
      />
      <main className="w-full md:container relative lg:flex md:w-auto md:mx-auto">
        <CloseSidebarContext.Provider value={setShowSidebar}>
          <Sidebar show={showSidebar} />
        </CloseSidebarContext.Provider>
        <section
          className={`mt-[60px] min-h-[calc(100vh-60px)] lg:min-h-0 ml-0 lg:grow pt-10 px-10 lg:px-6`}
        >
          <ErrorBoundary
            onReset={navigateToMainPage}
            fallbackUIWrapperClassName="flex flex-col justify-center items-center h-[70vh]"
          >
            <Outlet />
          </ErrorBoundary>
        </section>
      </main>
    </>
  );
};
