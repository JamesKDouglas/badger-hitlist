import { Card } from '@/app/ui/dashboard/cards';
import FollowUpsChart from '@/app/ui/dashboard/followups-chart';
import LatestFollowups from '@/app/ui/dashboard/latest-followups';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { ChartSkeleton, LatestFollowupsSkeleton, CardsSkeleton } from '@/app/ui/skeletons';
import CardWrapper from '@/app/ui/dashboard/cards';
 
export default async function Page() {

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback = {<CardsSkeleton/>}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback = {<ChartSkeleton/>}>
          <Chart/>
        </Suspense>
        <Suspense fallback = {<LatestDataSkeleton/>}>
          <LatestData/>
        </Suspense>
      </div>
    </main>
  );
}