import { Outlet } from "react-router";

export const CenterLayout: React.FC = ({ children }) => {
  return (
    <div className="h-screen flex justify-center items-center">
      <Outlet />
    </div>
  );
};
