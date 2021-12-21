import { SubmitHandler } from "react-hook-form";

type BasicFormProps = {
  onSubmit: SubmitHandler<any>;
};

export const BasicForm: React.FC<BasicFormProps> = ({ children, onSubmit }) => {
  return (
    <form
      noValidate={true}
      aria-label="form"
      className="w-full"
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
};
