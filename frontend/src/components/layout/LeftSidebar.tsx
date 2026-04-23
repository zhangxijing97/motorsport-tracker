import SectionCard from '../common/SectionCard';
import { topSeries } from '../../lib/mock-data';

export default function LeftSidebar() {
  return (
    <div className="space-y-4">
      <SectionCard className="p-5">
        <h2 className="font-display mb-5 text-[18px] font-semibold">
          Top Series
        </h2>

        <div className="space-y-4">
          {topSeries.map((item) => (
            <a
              key={item.id}
              href={item.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-1 py-1 transition hover:bg-neutral-50"
            >
              <div className="flex h-6 w-6 items-center justify-center text-[15px]">
                {item.icon}
              </div>
              <span className="font-display text-[15px] font-medium text-neutral-800">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}