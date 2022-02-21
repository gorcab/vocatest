import { Button } from "./Button";

type MessageUIProps = {
  type: "message";
  wrapperClassName?: string;
  message: string;
};

type ResetUIProps = Omit<MessageUIProps, "type"> & {
  type: "reset";
  onReset: () => void;
  resetButtonText: string;
};

type ErrorFallbackProps = ResetUIProps | MessageUIProps;

export const ErrorFallbackUI: React.FC<ErrorFallbackProps> = (props) => {
  const { message, wrapperClassName } = props;
  return (
    <div role="alert" className={wrapperClassName}>
      <h1 className="text-xl text-slate-500 mb-5 text-center whitespace-normal">
        {message}
      </h1>
      {props.type === "reset" ? (
        <div>
          <Button
            type="button"
            onClick={props.onReset}
            className="!w-48 !bg-red-600 text-white"
          >
            {props.resetButtonText}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
