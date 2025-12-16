export default function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen bg-play-bg overflow-hidden font-rounded text-play-text">
      {children}
    </div>
  );
}
