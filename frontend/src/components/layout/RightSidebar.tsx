import Link from 'next/link';
import { newsItems } from '../../lib/mock-data';

export default function RightSidebar() {
  const mainNews = newsItems[0];
  const sideNews = newsItems.slice(1, 6);

  return (
    <aside className="hidden w-[300px] shrink-0 xl:block">
      <div className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white">
        <div className="p-5">
          <h2 className="font-display text-[20px] font-semibold text-neutral-900">
            News
          </h2>

          {mainNews && (
            <Link
              href={`/news/${mainNews.id}?from=home`}
              className="group mt-5 block"
            >
              <div className="h-[160px] w-full overflow-hidden rounded-[18px]">
                <img
                  src={mainNews.imageUrl}
                  alt={mainNews.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>

              <h3 className="mt-4 font-display text-[18px] font-semibold leading-tight text-neutral-900 group-hover:underline">
                {mainNews.title}
              </h3>

              <p className="mt-2 text-[13px] text-neutral-500">
                {mainNews.source} · {mainNews.timeAgo}
              </p>
            </Link>
          )}
        </div>

        <div className="border-t border-neutral-100">
          {sideNews.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}?from=home`}
              className="group flex gap-4 p-5 transition hover:bg-neutral-50"
            >
              <div className="h-[72px] w-[88px] shrink-0 overflow-hidden rounded-[14px]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>

              <div>
                <h4 className="font-display text-[14px] font-semibold leading-tight text-neutral-900 group-hover:underline">
                  {item.title}
                </h4>

                <p className="mt-2 text-[12px] text-neutral-500">
                  {item.source} · {item.timeAgo}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="border-t border-neutral-100 p-4 text-center">
          <Link
            href="/news"
            className="text-[14px] font-medium text-neutral-600 hover:text-black"
          >
            View all news →
          </Link>
        </div>
      </div>
    </aside>
  );
}