import { Route, Routes } from "react-router";
import { Layout } from "./features/common/components/Layout";
import { Protected } from "./features/common/components/Protected";
import { LoginPage } from "./pages/LoginPage";
import { MainPage } from "./pages/MainPage";
import { useUserQuery } from "./features/api/slice";
import { useSelector } from "react-redux";
import { selectUserAndAccessToken } from "./features/user/slice";
import { CenterLayout } from "./features/common/components/CenterLayout";
import { Spinner } from "./features/common/components/Spinner";
import { SignUpPage } from "./pages/SignUpPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const loginUrl = "login";
export const resetPasswordUrl = "reset-password";
export const signUpUrl = "sign-up";

function App() {
  const { user, accessToken } = useSelector(selectUserAndAccessToken);
  const { isLoading } = useUserQuery(undefined, {
    skip: !(!user && accessToken),
  });

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoading ? (
            <CenterLayout>
              <Spinner color="#2b28cf" gap={2} thickness={2} size={"3em"} />
            </CenterLayout>
          ) : (
            <Layout />
          )
        }
      >
        <Route
          index
          element={
            <Protected>
              <MainPage />
            </Protected>
          }
        />
        <Route
          path="categories/:categoryId"
          element={
            <Protected>
              <div>Category 페이지</div>
            </Protected>
          }
        />
        <Route path={loginUrl} element={<LoginPage />} />
        <Route path={signUpUrl} element={<SignUpPage />} />
        <Route path={resetPasswordUrl} element={<ResetPasswordPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
