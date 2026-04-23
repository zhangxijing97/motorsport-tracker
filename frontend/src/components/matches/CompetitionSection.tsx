import SectionCard from '../common/SectionCard';
import MatchRow from './MatchRow';
import type { CompetitionGroup } from '../../lib/types';

export default function CompetitionSection({
  group,
}: {
  group: CompetitionGroup;
}) {
  return (
    <SectionCard className="overflow-hidden">
      <div className="flex items-center justify-between bg-neutral-50 px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="text-[24px]">{group.icon}</div>
          <h3 className="text-[20px] font-semibold">{group.name}</h3>
        </div>

        <button className="text-neutral-400">▲</button>
      </div>

      <div className="bg-white">
        {group.matches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </SectionCard>
  );
}