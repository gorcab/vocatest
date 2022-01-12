import { Navigate, Route, Routes, useLocation } from "react-router";
import { CenterLayout } from "../../features/common/components/CenterLayout";
import { LoginPage } from "../../pages/LoginPage";
import { ResetPasswordPage } from "../../pages/ResetPasswordPage";
import { SignUpPage } from "../../pages/SignUpPage";

export const unAuthenticatedRoutes = [
  { id: 1, path: "login", element: <LoginPage /> },
  { id: 2, path: "sign-up", element: <SignUpPage /> },
  { id: 3, path: "reset-password", element: <ResetPasswordPage /> },
];

export const UnauthenticatedApp: React.FC = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<CenterLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        {unAuthenticatedRoutes.map(({ id, path, element }, i) => (
          <Route key={id} path={"/" + path} element={element} />
        ))}

        <Route path="login" element={<LoginPage />} />
        <Route path="sign-up" element={<SignUpPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            state={{
              from: location.pathname + location.search, // login 후 처음 접속했던 url로 리다이렉션하기 위함
            }}
            replace
          />
        }
      />
    </Routes>
  );
};
