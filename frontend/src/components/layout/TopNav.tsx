import Link from 'next/link';
import SearchBar from '../common/SearchBar';
import { Apple, Play } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-[86px] max-w-[1300px] items-center justify-between px-8">

        {/* LEFT */}
        <div className="ml-8 flex items-center gap-8">
          <Link
            href="/"
            className="font-display text-[28px] font-bold tracking-tight"
          >
            MOTORSPORT
          </Link>

          <SearchBar />
        </div>

        {/* RIGHT (nav + icons merged) */}
        <div className="hidden items-center gap-8 lg:flex">

          {/* NAV */}
          <nav className="flex items-center gap-6">
            <Link
              href="/news"
              className="font-display text-[20px] font-semibold text-neutral-900 transition hover:text-black"
            >
              News
            </Link>

            <Link
              href="/about"
              className="font-display text-[20px] font-semibold text-neutral-900 transition hover:text-black"
            >
              About
            </Link>
          </nav>

          {/* ICONS */}
          {/* <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-neutral-200" />

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm">
              
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm">
              ▶
            </div>
          </div> */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-px bg-neutral-200" />

            {/* App Store */}
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              // className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-white transition hover:scale-105 hover:bg-neutral-800"
              className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-neutral-900 transition hover:scale-105 hover:bg-neutral-100"
            >
              <Apple size={16} />
              <span className="text-sm font-medium">App Store</span>
            </a>

            {/* Google Play */}
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-neutral-900 transition hover:scale-105 hover:bg-neutral-100"
            >
              <Play size={16} />
              <span className="text-sm font-medium">Google Play</span>
            </a>
          </div>

        </div>

      </div>
    </header>
  );
}