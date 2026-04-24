// import SectionCard from '../common/SectionCard';
// import MatchRow from './MatchRow';
// import type { CompetitionGroup } from '../../lib/types';
// import { topSeries } from '../../lib/mock-data';

// function getSeriesLogo(group: CompetitionGroup) {
//   const groupName = group.name.toLowerCase();

//   const matchedSeries = topSeries.find((series) => {
//     const seriesId = series.id.toLowerCase();
//     const seriesName = series.name.toLowerCase();

//     return (
//       groupName.includes(seriesId) ||
//       groupName.includes(seriesName)
//     );
//   });

//   return matchedSeries?.logo;
// }

// export default function CompetitionSection({
//   group,
// }: {
//   group: CompetitionGroup;
// }) {
//   const logo = getSeriesLogo(group);

//   return (
//     <SectionCard className="overflow-hidden">
//       <div className="flex items-center justify-between bg-neutral-50 px-5 py-5">
//         <div className="flex items-center gap-3">
//           {logo ? (
//             <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-sm bg-white">
//               <img
//                 src={logo}
//                 alt={group.name}
//                 className="h-full w-full object-contain opacity-90"
//               />
//             </div>
//           ) : (
//             <div className="text-[18px] opacity-80">{group.icon}</div>
//           )}
//           <h3 className="max-w-[520px] truncate text-[20px] font-semibold tracking-tight">
//             {group.name}
//           </h3>
//         </div>
//       </div>

//       <div className="bg-white">
//         {group.matches.map((match) => (
//           <MatchRow key={match.id} match={match} />
//         ))}
//       </div>
//     </SectionCard>
//   );
// }

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
        <div className="flex min-w-0 items-center">
          <div className="min-w-0">
            <h3 className="max-w-[520px] truncate text-[20px] font-semibold tracking-tight text-neutral-900">
              {group.seriesName} · {group.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white">
        {group.matches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </SectionCard>
  );
}