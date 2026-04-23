export default function Pill({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`font-display rounded-full border px-5 py-2 text-[17px] font-medium transition ${
        active
          ? 'border-neutral-300 bg-white text-neutral-900'
          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      {label}
    </button>
  );
}