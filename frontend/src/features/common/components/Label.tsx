type LabelProps = {
  name: string;
  label: string;
};

export const Label: React.FC<LabelProps> = ({ name, label }) => {
  return (
    <label htmlFor={name} className="text-slate-500 block pb-1">
      {label}
    </label>
  );
};
