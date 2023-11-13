export function TypographyH2({ children }: any) {
  return (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}

export function TypographyH4({ children, className }: any) {
  return (
    <h4
      className={
        "scroll-m-20 text-lg font-semibold tracking-tight " + (className || "")
      }
    >
      {children}
    </h4>
  );
}
