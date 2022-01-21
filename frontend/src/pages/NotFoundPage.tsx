import { ErrorFallbackUI } from "../features/common/components/ErrorFallbackUI";

export const NotFoundPage: React.FC = () => {
  return (
    <main className="relative h-screen">
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 translate-y-1/2">
        <ErrorFallbackUI
          status={404}
          message="요청하신 페이지를 찾을 수 없습니다."
        />
      </div>
    </main>
  );
};
