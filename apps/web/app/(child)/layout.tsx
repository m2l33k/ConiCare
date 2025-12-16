export default function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen bg-purple-600 overflow-hidden">
      {children}
    </div>
  );
}
