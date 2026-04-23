export default function SectionCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[28px] border border-neutral-200 bg-white ${className}`}
    >
      {children}
    </section>
  );
}