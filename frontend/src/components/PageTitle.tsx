interface PageTitleProps {
  children: React.ReactNode;
}

export const PageTitle = ({ children }: PageTitleProps) => {
  return (
    <h1 className="tablet:text-4xl tablet:font-black text-2xl font-bold text-alabaster">
      {children}
    </h1>
  );
};
