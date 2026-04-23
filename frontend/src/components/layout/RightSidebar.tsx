import SectionCard from '../common/SectionCard';
import { rightNews } from '../../lib/mock-data';

export default function RightSidebar() {
  const featured = rightNews[0];
  const secondary = rightNews[1];

  return (
    <div className="space-y-4">
      <SectionCard className="overflow-hidden">
        <div className="p-4">
          <h3 className="font-display text-[18px] font-semibold">News</h3>
        </div>

        <div className="px-4 pb-4">
          <img
            src={featured.image}
            alt={featured.title}
            className="h-[150px] w-full rounded-[20px] object-cover"
          />
          <h4 className="font-display mt-3 text-[16px] font-semibold leading-6">
            {featured.title}
          </h4>
          <p className="mt-2 text-[13px] text-neutral-500">
            {featured.source} · {featured.timeAgo}
          </p>
        </div>

        <div className="border-t border-neutral-100 px-4 py-3">
          <div className="flex gap-3">
            <img
              src={secondary.image}
              alt={secondary.title}
              className="h-[68px] w-[78px] rounded-[16px] object-cover"
            />
            <div>
              <h5 className="font-display line-clamp-3 text-[14px] font-semibold leading-5">
                {secondary.title}
              </h5>
              <p className="mt-2 text-[12px] text-neutral-500">
                {secondary.source} · {secondary.timeAgo}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}