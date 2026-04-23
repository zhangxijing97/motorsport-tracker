import Link from 'next/link';
import TopNav from '../../../components/layout/TopNav';
import { getSessionDetail } from '../../../lib/api';

type SessionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatWeekendRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const month = startDate.toLocaleDateString(undefined, { month: 'short' });
  const year = startDate.getFullYear();

  return `${startDay} - ${endDay} ${month.toUpperCase()} ${year}`;
}

function formatGapOrBestTime(
  bestLapTime?: string | null,
  gapToLeader?: string | null,
) {
  if (bestLapTime) return bestLapTime;
  if (gapToLeader) return gapToLeader;
  return '-';
}

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { id } = await params;
  const detail = await getSessionDetail(id);

  return (
    <main className="min-h-screen bg-[#f4f4f4]">
      <TopNav />

      <div className="mx-auto max-w-[1280px] px-8 py-6 xl:px-10">
        <div className="mb-5">
          <Link
            href="/"
            className="text-[14px] text-neutral-500 transition hover:text-black"
          >
            ← Back
          </Link>
        </div>

        <div className="mb-6 rounded-[24px] border border-neutral-200 bg-white p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-full border border-neutral-300 px-4 py-2 text-[14px] font-medium">
              {detail.event.country}
            </div>
            <div className="rounded-full border border-neutral-300 px-4 py-2 text-[14px] font-medium">
              {detail.session.name}
            </div>
          </div>

          <h1 className="font-display max-w-[900px] text-[42px] font-bold leading-[1.05] text-neutral-900">
            {detail.event.seriesName.toUpperCase()} {detail.event.eventName.toUpperCase()} ·{' '}
            {detail.session.name.toUpperCase()}
          </h1>

          <div className="mt-6 text-[16px] text-neutral-600">
            <div className="font-semibold text-neutral-700">
              {formatWeekendRange(detail.event.dateStart, detail.event.dateEnd)}
            </div>
            <div className="mt-1">{detail.event.venueName}, {detail.event.location}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white">
          <div className="grid grid-cols-[90px_120px_1.4fr_1.2fr_180px_100px] border-b border-neutral-200 px-8 py-5 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
            <div>Pos.</div>
            <div>No.</div>
            <div>Driver</div>
            <div>Team</div>
            <div>Time / Gap</div>
            <div>Laps</div>
          </div>

          {detail.classification.map((row) => (
            <div
              key={row.driverNumber}
              className="grid grid-cols-[90px_120px_1.4fr_1.2fr_180px_100px] items-center border-b border-neutral-100 px-8 py-5 last:border-b-0"
            >
              <div className="font-display text-[18px] font-semibold text-neutral-900">
                {row.position}
              </div>

              <div className="font-display text-[18px] font-semibold text-neutral-900">
                {row.driverNumber}
              </div>

              <div className="flex items-center gap-3">
                {row.headshotUrl ? (
                  <img
                    src={row.headshotUrl}
                    alt={row.driverName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-neutral-200" />
                )}

                <div className="font-display text-[18px] font-semibold text-neutral-900">
                  {row.driverName}
                </div>
              </div>

              <div className="font-display text-[18px] font-semibold text-neutral-900">
                {row.teamName}
              </div>

              <div className="font-display text-[18px] font-semibold text-neutral-900">
                {formatGapOrBestTime(row.bestLapTime, row.gapToLeader)}
              </div>

              <div className="font-display text-[18px] font-semibold text-neutral-900">
                {row.laps}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}