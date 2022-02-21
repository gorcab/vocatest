import { useNavigate } from "react-router";
import { ErrorFallbackUI } from "../features/common/components/ErrorFallbackUI";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <main className="relative h-screen">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <ErrorFallbackUI
          type="reset"
          wrapperClassName="h-screen flex justify-center items-center flex-col"
          message="요청하신 페이지를 찾을 수 없습니다."
          onReset={() =>
            navigate("/", {
              replace: true,
            })
          }
          resetButtonText="메인 페이지로 돌아가기"
        />
      </div>
    </main>
  );
};
