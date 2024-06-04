import { generateYAxis } from '@/app/lib/utils';
import { lusitana } from '@/app/ui/fonts';
import { fetchUpcomingWork } from '@/app/lib/getter';

// This component is representational only.
// For data visualization UI, check out:
// https://www.tremor.so/
// https://www.chartjs.org/
// https://airbnb.io/visx/

export default async function Chart() {
  const data = await fetchUpcomingWork();
  const xAxisTitle = "Followups required by day";
  const chartTitle = "Upcoming Work";

  const chartHeight = 350;
  console.log("chart function data:", data);

  const { yAxisLabels, topLabel } = generateYAxis(data);

  if (!data || data.length === 0) {
    return <p className="mt-4 text-gray-400">No data available.</p>;
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        {chartTitle}
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="sm:grid-cols-9 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>
          <div key="blank" className="flex flex-col items-center gap-2">
              <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
              </p>
          </div>
          {data.map((period) => (
            <div key={period.period} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-blue-300"
                style={{
                  height: `${(chartHeight / topLabel) * period.children}px`,
                }}
              ></div>
              <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                {period.period}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">{xAxisTitle}</h3>
        </div>
      </div>
    </div>
  );
}
