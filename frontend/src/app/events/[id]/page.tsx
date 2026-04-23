import Link from 'next/link';
import TopNav from '../../../components/layout/TopNav';

export default function EventDetailPage() {
  return (
    <main className="min-h-screen bg-[#f4f4f4]">
      <TopNav />

      <div className="mx-auto max-w-[1100px] px-8 py-8">
        <Link href="/" className="text-sm text-neutral-500 hover:text-black">
          ← Back
        </Link>

        <div className="mt-4 rounded-[28px] border border-neutral-200 bg-white p-8">
          <h1 className="font-display text-[40px] font-bold">Event Detail</h1>
          <p className="mt-3 text-[17px] text-neutral-500">
            This page will later show the selected event details.
          </p>
        </div>
      </div>
    </main>
  );
}