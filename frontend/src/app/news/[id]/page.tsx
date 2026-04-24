import Link from 'next/link';
import TopNav from '../../../components/layout/TopNav';
import { newsItems } from '../../../lib/mock-data';

type NewsDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function NewsDetailPage({
  params,
  searchParams,
}: NewsDetailPageProps) {
  const { id } = await params;
  const { from } = await searchParams;

  const news = newsItems.find((item) => item.id === id);
  const backHref = from === 'news' ? '/news' : '/';

  if (!news) {
    return (
      <main className="min-h-screen bg-[#f4f4f4]">
        <TopNav />

        <div className="mx-auto max-w-[900px] px-8 py-10">
          <Link href={backHref} className="text-[14px] text-neutral-500">
            ← Back
          </Link>

          <div className="mt-6 rounded-[24px] border border-neutral-200 bg-white p-8">
            <h1 className="font-display text-[32px] font-bold">
              News not found
            </h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4]">
      <TopNav />

      <article className="mx-auto max-w-[900px] px-8 py-10">
        <Link
          href={backHref}
          className="text-[14px] text-neutral-500 hover:text-black"
        >
          ← Back
        </Link>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-neutral-200 bg-white">
          <div className="h-[360px] w-full overflow-hidden">
            <img
              src={news.imageUrl}
              alt={news.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-8">
            <p className="text-[14px] text-neutral-500">
              {news.source} · {news.timeAgo}
            </p>

            <h1 className="mt-4 font-display text-[42px] font-bold leading-tight text-neutral-900">
              {news.title}
            </h1>

            <p className="mt-6 text-[18px] leading-8 text-neutral-700">
              {news.content}
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}