import SearchBar from '../common/SearchBar';

export default function TopNav() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-[86px] max-w-[1450px] items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <div className="font-display text-[28px] font-bold tracking-tight">
            MOTORSPORT
          </div>
          <SearchBar />
        </div>

        <nav className="hidden items-center gap-12 lg:flex">
          <a
            href="#"
            className="font-display text-[20px] font-semibold text-neutral-900 transition hover:text-black"
          >
            News
          </a>
          <a
            href="#"
            className="font-display text-[20px] font-semibold text-neutral-900 transition hover:text-black"
          >
            About
          </a>
          <a
            href="#"
            className="font-display text-[20px] font-semibold text-neutral-900 transition hover:text-black"
          >
            TV schedules
          </a>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <button className="font-display text-xl text-neutral-700">⚙</button>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm">
            
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm">
            ▶
          </div>
        </div>
      </div>
    </header>
  );
}