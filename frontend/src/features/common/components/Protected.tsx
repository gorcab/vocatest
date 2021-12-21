import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

export const Protected = ({ children }: { children: JSX.Element }) => {
  const user = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
};
