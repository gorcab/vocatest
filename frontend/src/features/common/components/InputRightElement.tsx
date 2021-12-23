export const InputRightElement: React.FC = ({ children }) => {
  return (
    <div className="absolute right-1 inset-y-1/2 translate-y-1/2 flex justify-center items-center">
      {children}
    </div>
  );
};
