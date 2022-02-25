import { Navigate, Route, Routes, useLocation } from "react-router";
import { EditUserProfilePage } from "pages/EditUserProfilePage";
import { unAuthenticatedRoutes } from "./UnauthenticatedApp";
import { useUserQuery } from "features/api/slice";
import { CenterLayout } from "features/common/components/CenterLayout";
import { Spinner } from "features/common/components/Spinner";
import { Protected } from "features/common/components/Protected";
import { MainLayout } from "features/common/components/MainLayout";
import { MainPage } from "pages/MainPage";
import { CreateVocabularyListPage } from "pages/CreateVocabularyListPage";
import { EditVocabularyListPage } from "pages/EditVocabularyListPage";
import { NotFoundPage } from "pages/NotFoundPage";
import { VocabularyProblemListPage } from "pages/VocabularyProblemListPage";

export const AuthenticatedApp: React.FC = () => {
  const { isLoading } = useUserQuery();
  const location = useLocation();
  const unauthenticatedPathNames = unAuthenticatedRoutes.map(
    (route) => "/" + route.path
  );

  if (unauthenticatedPathNames.includes(location.pathname)) {
    if (location.state?.from) {
      // 로그인이 완료되면 처음 들어왔던 url로 리다이렉션
      return <Navigate to={location.state.from} replace />;
    }
    return <Navigate to="/" replace />;
  }

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
            <Protected>
              <MainLayout />
            </Protected>
          )
        }
      >
        <Route index element={<MainPage />} />
        <Route
          path="create-vocabulary"
          element={<CreateVocabularyListPage />}
        />
        <Route
          path="vocabularies/:id"
          element={<VocabularyProblemListPage />}
        />
        <Route
          path="edit-vocabulary/:id"
          element={<EditVocabularyListPage />}
        />
        <Route path="profile" element={<EditUserProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
