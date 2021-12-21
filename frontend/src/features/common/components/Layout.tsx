import { Outlet, useLocation } from "react-router";
import { loginUrl, resetPasswordUrl, signUpUrl } from "../../../App";
import { CenterLayout } from "./CenterLayout";
import { MainLayout } from "./MainLayout";

export const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const LayoutComponent = [
    "/" + loginUrl,
    "/" + resetPasswordUrl,
    "/" + signUpUrl,
  ].includes(pathname)
    ? CenterLayout
    : MainLayout;

  return (
    <LayoutComponent>
      <Outlet />
    </LayoutComponent>
  );
};
