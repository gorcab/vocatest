import { UnauthenticatedApp } from "./app/components/UnauthenticatedApp";
import { AuthenticatedApp } from "./app/components/AuthenticatedApp";
import { Spinner } from "./features/common/components/Spinner";
import { CenterLayout } from "./features/common/components/CenterLayout";
import { useInitialApp } from "./features/common/hooks/useInitialApp";

function App() {
  const { user, isLoading } = useInitialApp();

  if (isLoading) {
    return (
      <CenterLayout>
        <Spinner color="#2b28cf" gap={2} thickness={2} size={"3em"} />
      </CenterLayout>
    );
  }

  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

export default App;
