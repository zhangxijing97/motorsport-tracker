// import type { MatchItem } from '../../lib/types';
// import {
//   getStatusBadgeText,
//   isFinished,
//   isLive,
//   isUpcoming,
// } from '../../lib/format';

// export default function MatchRow({ match }: { match: MatchItem }) {
//   const statusText = getStatusBadgeText(match);

//   return (
//     <div className="grid min-h-[80px] grid-cols-[78px_1fr] border-t border-neutral-100 first:border-t-0">
//       <div className="flex items-center justify-center">
//         <div
//           className={`font-display flex h-[44px] min-w-[44px] items-center justify-center rounded-full px-3 text-[14px] font-semibold whitespace-nowrap ${
//             isFinished(match)
//               ? 'bg-neutral-100 text-neutral-500'
//               : isLive(match)
//               ? 'bg-emerald-600 text-white'
//               : 'bg-neutral-100 text-neutral-700'
//           }`}
//         >
//           {statusText}
//         </div>
//       </div>

//       <div className="flex items-center px-3 py-3">
//         <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
//           <div className="font-display text-right text-[16px] font-medium text-neutral-900">
//             {match.homeName}
//           </div>

//           <div className="min-w-[120px] text-center">
//             {match.centerPrimary ? (
//               <>
//                 <div className="font-display text-[16px] font-semibold leading-none text-neutral-900">
//                   {match.centerPrimary}
//                 </div>
//                 {match.centerSecondary ? (
//                   <div className="font-display mt-1 text-[12px] font-medium text-neutral-500">
//                     {match.centerSecondary}
//                   </div>
//                 ) : null}
//               </>
//             ) : isUpcoming(match) ? (
//               <div className="font-display text-[16px] font-semibold text-neutral-900">
//                 {match.minuteOrTime}
//               </div>
//             ) : (
//               <>
//                 <div className="font-display text-[22px] font-bold leading-none text-neutral-900">
//                   {match.homeScore ?? '-'}
//                   <span className="mx-2">-</span>
//                   {match.awayScore ?? '-'}
//                 </div>

//                 {match.aggregate ? (
//                   <div className="font-display mt-1 text-[13px] font-medium text-neutral-500">
//                     {match.aggregate}
//                   </div>
//                 ) : null}
//               </>
//             )}
//           </div>

//           <div className="font-display text-left text-[16px] font-medium text-neutral-900">
//             {match.awayName}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import Link from 'next/link';
import type { MatchItem } from '../../lib/types';
import {
  getStatusBadgeText,
  isFinished,
  isLive,
  isUpcoming,
} from '../../lib/format';

export default function MatchRow({ match }: { match: MatchItem }) {
  const statusText = getStatusBadgeText(match);

  return (
    <Link
      href={`/sessions/${encodeURIComponent(match.id)}`}
      className="grid min-h-[80px] grid-cols-[78px_1fr] border-t border-neutral-100 first:border-t-0 transition hover:bg-neutral-50"
    >
      <div className="flex items-center justify-center">
        <div
          className={`font-display flex h-[44px] min-w-[44px] items-center justify-center rounded-full px-3 text-[14px] font-semibold whitespace-nowrap ${
            isFinished(match)
              ? 'bg-neutral-100 text-neutral-500'
              : isLive(match)
              ? 'bg-emerald-600 text-white'
              : 'bg-neutral-100 text-neutral-700'
          }`}
        >
          {statusText}
        </div>
      </div>

      <div className="flex items-center px-3 py-3">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="font-display text-right text-[16px] font-medium text-neutral-900">
            {match.homeName}
          </div>

          <div className="min-w-[120px] text-center">
            {match.centerPrimary ? (
              <>
                <div className="font-display text-[16px] font-semibold leading-none text-neutral-900">
                  {match.centerPrimary}
                </div>
                {match.centerSecondary ? (
                  <div className="font-display mt-1 text-[12px] font-medium text-neutral-500">
                    {match.centerSecondary}
                  </div>
                ) : null}
              </>
            ) : isUpcoming(match) ? (
              <div className="font-display text-[16px] font-semibold text-neutral-900">
                {match.minuteOrTime}
              </div>
            ) : (
              <>
                <div className="font-display text-[22px] font-bold leading-none text-neutral-900">
                  {match.homeScore ?? '-'}
                  <span className="mx-2">-</span>
                  {match.awayScore ?? '-'}
                </div>

                {match.aggregate ? (
                  <div className="font-display mt-1 text-[13px] font-medium text-neutral-500">
                    {match.aggregate}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="font-display text-left text-[16px] font-medium text-neutral-900">
            {match.awayName}
          </div>
        </div>
      </div>
    </Link>
  );
}