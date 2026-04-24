import Link from 'next/link';
import TopNav from '../../components/layout/TopNav';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f4f4f4]">
      <TopNav />

      <div className="mx-auto max-w-[1100px] px-8 py-8">
        <section className="rounded-[24px] border border-neutral-200 bg-white p-8">
          <p className="text-[14px] font-medium uppercase tracking-wide text-neutral-500">
            About
          </p>

          <h1 className="mt-4 font-display text-[44px] font-bold leading-tight text-neutral-900">
            A simple motorsport tracker for schedules, sessions, and race results.
          </h1>

          <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-neutral-600">
            Motorsport Tracker is a centralized racing platform built to follow
            multiple series in one place, including Formula 1, Formula E,
            IndyCar, NASCAR, MotoGP, and more.
          </p>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-[24px] border border-neutral-200 bg-white p-6">
            <h2 className="font-display text-[22px] font-semibold text-neutral-900">
              Multi-series coverage
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-neutral-600">
              Designed to support different racing championships through a
              shared event and session model.
            </p>
          </div>

          <div className="rounded-[24px] border border-neutral-200 bg-white p-6">
            <h2 className="font-display text-[22px] font-semibold text-neutral-900">
              Real API data
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-neutral-600">
              The backend connects to OpenF1 and Sportradar providers to fetch
              schedules, sessions, and results.
            </p>
          </div>

          <div className="rounded-[24px] border border-neutral-200 bg-white p-6">
            <h2 className="font-display text-[22px] font-semibold text-neutral-900">
              Built for expansion
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-neutral-600">
              The project structure is prepared for adding more series,
              standings, news, authentication, and user favorites.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-neutral-200 bg-white p-8">
          <h2 className="font-display text-[28px] font-semibold text-neutral-900">
            Tech stack
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[18px] bg-neutral-50 p-5">
              <h3 className="font-display text-[18px] font-semibold">
                Frontend
              </h3>
              <p className="mt-2 text-[15px] text-neutral-600">
                Next.js, React, TypeScript, Tailwind CSS
              </p>
            </div>

            <div className="rounded-[18px] bg-neutral-50 p-5">
              <h3 className="font-display text-[18px] font-semibold">
                Backend
              </h3>
              <p className="mt-2 text-[15px] text-neutral-600">
                NestJS, TypeScript, OpenF1 API, Sportradar API
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <Link
            href="/"
            className="text-[15px] font-medium text-neutral-600 hover:text-black"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}