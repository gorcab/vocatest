import { SubmitHandler } from "react-hook-form";

type BasicFormProps = {
  onSubmit: SubmitHandler<any>;
  formLabel: string;
};

export const BasicForm: React.FC<BasicFormProps> = ({
  children,
  formLabel,
  onSubmit,
}) => {
  return (
    <form
      noValidate={true}
      aria-label={formLabel}
      className="w-full"
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
};
