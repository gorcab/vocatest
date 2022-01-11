export const NotFoundPage: React.FC = () => {
  return (
    <main className="relative h-screen">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="text-neutral-900 text-center mb-2 font-extrabold text-7xl">
          404
        </h1>
        <p className="text-neutral-700">요청하신 페이지를 찾을 수 없습니다.</p>
      </div>
    </main>
  );
};
