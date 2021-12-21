import { Navigate, useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useAuth } from "../features/common/hooks/useAuth";
import { LoginForm } from "../features/user/components/LoginForm";

export const LoginPage: React.FC = () => {
  const user = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    return <Navigate to="/" />;
  }

  const navigateToPrevPage = () => {
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  return (
    <main className="w-4/5 sm:w-2/5 md:w-80 max-w-sm flex justify-center flex-col rounded border p-5 bg-white shadow-sm">
      <h1 className="text-blue-500 text-center text-4xl font-extrabold mb-4">
        VOCATEST
      </h1>
      <LoginForm handleSuccess={navigateToPrevPage} />
      <div className="flex justify-between mt-3">
        <Link to="/reset-password" className="text-slate-400 text-sm">
          비밀번호 재설정
        </Link>
        <Link to="/sign-up" className="text-slate-400 text-sm">
          회원가입
        </Link>
      </div>
    </main>
  );
};
