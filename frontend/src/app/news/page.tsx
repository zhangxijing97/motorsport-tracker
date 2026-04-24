import Link from 'next/link';
import TopNav from '../../components/layout/TopNav';
import { newsItems } from '../../lib/mock-data';

export default function NewsPage() {
  const heroNews = newsItems[0];
  const topList = newsItems.slice(1, 6);
  const moreNews = newsItems.slice(1);

  return (
    <main className="min-h-screen bg-[#f4f4f4]">
      <TopNav />

      <div className="mx-auto max-w-[1280px] px-8 py-8">
        <section className="rounded-[24px] border border-neutral-200 bg-white p-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            {heroNews && (
              <Link
                href={`/news/${heroNews.id}?from=news`}
                className="group overflow-hidden rounded-[18px] bg-neutral-900"
              >
                <div className="h-[340px] overflow-hidden">
                  <img
                    src={heroNews.imageUrl}
                    alt={heroNews.title}
                    className="h-full w-full object-cover opacity-80 transition group-hover:scale-105"
                  />
                </div>

                <div className="bg-[#26376c] p-6 text-white">
                  <h1 className="font-display text-[32px] font-bold leading-tight">
                    {heroNews.title}
                  </h1>

                  <p className="mt-4 text-[14px] text-white/80">
                    {heroNews.source} · {heroNews.timeAgo}
                  </p>
                </div>
              </Link>
            )}

            <div className="flex flex-col">
              {topList.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}?from=news`}
                  className="group border-b border-neutral-100 py-4 first:pt-0 last:border-b-0"
                >
                  <h2 className="font-display text-[18px] font-semibold leading-snug text-neutral-900 group-hover:underline">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-[13px] text-neutral-500">
                    {item.source} · {item.timeAgo}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-neutral-200 bg-white p-6">
          <h2 className="font-display text-[22px] font-semibold text-neutral-900">
            Trending
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {moreNews.map((item, index) => (
              <Link
                key={item.id}
                href={`/news/${item.id}?from=news`}
                className="group flex gap-4 rounded-[18px] p-3 transition hover:bg-neutral-50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-[14px] font-bold text-white">
                  {index + 1}
                </div>

                <div className="flex flex-1 gap-4">
                  <div>
                    <h3 className="font-display text-[17px] font-semibold leading-snug text-neutral-900 group-hover:underline">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-[13px] text-neutral-500">
                      {item.source} · {item.timeAgo}
                    </p>
                  </div>

                  <div className="ml-auto h-[78px] w-[110px] shrink-0 overflow-hidden rounded-[14px]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}