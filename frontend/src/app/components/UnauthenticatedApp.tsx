import { Navigate, useLocation, useRoutes } from "react-router";
import { CenterLayout } from "../../features/common/components/CenterLayout";
import { LoginPage } from "../../pages/LoginPage";
import { ResetPasswordPage } from "../../pages/ResetPasswordPage";
import { SignUpPage } from "../../pages/SignUpPage";

export const unAuthenticatedRoutes = [
  { path: "login", element: <LoginPage /> },
  { path: "sign-up", element: <SignUpPage /> },
  { path: "reset-password", element: <ResetPasswordPage /> },
];

export const UnauthenticatedApp: React.FC = () => {
  const location = useLocation();
  const NotFoundElement = (
    <Navigate
      to="/login"
      state={{
        from: location.pathname + location.search, // login 후 처음 접속했던 url로 리다이렉션하기 위함
      }}
      replace
    />
  );

  const routeElements = useRoutes([
    {
      path: "/",
      element: <CenterLayout />,
      children: [
        { index: true, element: NotFoundElement },
        ...unAuthenticatedRoutes,
        {
          path: "*",
          element: NotFoundElement,
        },
      ],
    },
  ]);

  return routeElements;
};
