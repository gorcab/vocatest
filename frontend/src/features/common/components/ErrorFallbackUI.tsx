import { Button } from "./Button";

type ErrorFallbackProps = {
  status?: number;
  message: string;
  onReset?: () => void;
};

export const ErrorFallbackUI: React.FC<ErrorFallbackProps> = ({
  status,
  message,
  onReset,
}) => {
  return (
    <div role="alert" className="flex items-center flex-col">
      {status && (
        <h1 className="text-neutral-900 text-center mb-2 font-extrabold text-7xl">
          {status}
        </h1>
      )}
      <h2 className="text-xl text-slate-500 mb-5 text-center">{message}</h2>
      {onReset ? (
        <Button
          type="button"
          onClick={onReset}
          className="!w-48 !bg-red-600 text-white"
        >
          재요청
        </Button>
      ) : null}
    </div>
  );
};
