export default function Page({ children }: { children: any }) {
  return <div className="flex-1 relative overflow-y-auto" id="page">{children}</div>;
}
