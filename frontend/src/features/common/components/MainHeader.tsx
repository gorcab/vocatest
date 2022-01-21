type MainHeaderProps = {
  title?: string;
  rightElement?: React.ReactNode;
};

export const MainHeader: React.FC<MainHeaderProps> = ({
  title,
  rightElement,
  children,
}) => {
  return (
    <header className="h-14 flex flex-col">
      {title && (
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl text-blue-600">{title}</h1>
          {rightElement}
        </div>
      )}
      {children}
    </header>
  );
};
