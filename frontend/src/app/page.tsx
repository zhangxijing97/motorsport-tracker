import TopNav from '../components/layout/TopNav';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightSidebar from '../components/layout/RightSidebar';
import MatchesToolbar from '../components/matches/MatchesToolbar';
import CompetitionSection from '../components/matches/CompetitionSection';
import { getTodayCompetitionGroups } from '../lib/api';

type HomePageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedDate = resolvedSearchParams?.date;

  const competitionGroups = await getTodayCompetitionGroups(selectedDate);

  return (
    <main className="min-h-screen bg-[#f4f4f4]">
      <TopNav />

      <div className="mx-auto max-w-[1280px] px-8 py-6 xl:px-10">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[250px_minmax(0,1fr)_280px]">
          <aside className="hidden xl:block">
            <LeftSidebar />
          </aside>

          <section className="space-y-4">
            <MatchesToolbar selectedDate={selectedDate} />

            {competitionGroups.length === 0 ? (
              <div className="rounded-[24px] border border-neutral-200 bg-white p-8 text-center">
                <h2 className="font-display text-[22px] font-semibold text-neutral-900">
                  No sessions found
                </h2>
                <p className="mt-2 text-[14px] text-neutral-500">
                  Try choosing another date from the date picker.
                </p>
              </div>
            ) : (
              competitionGroups.map((group) => (
                <CompetitionSection key={group.id} group={group} />
              ))
            )}
          </section>

          <aside className="hidden xl:block">
            <RightSidebar />
          </aside>
        </div>
      </div>
    </main>
  );
}