import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const formatMoney = (n) =>
  "₱" + n.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ".00";

// placeholder :like:
const getStatus = (amount, total) => {
  if (total <= 0) return "Unknown";
  const percentage = (amount / total) * 100;

  if (percentage === 0) return "Not Started";
  if (percentage < 75) return "In Progress";
  if (percentage < 100) return "Almost Complete";
  return "Completed";
};
  const GoalCardGlassMobile = ({ goal }) => {
    if (!goal) return null; // ✅ Prevents crashing if undefined
    const remaining = goal.total - goal.amount;
    const progressCurrent = goal.amount;
    const progressTotal = goal.total;
    const percent = Math.min(Math.max((progressCurrent / progressTotal) * 100, 0), 100);
    const status = getStatus(goal.amount, goal.total);

    const chartData = {
      datasets: [
        {
          data: [progressCurrent, remaining > 0 ? remaining : 0],
          backgroundColor: ['#DDB440', 'rgba(255, 255, 255, 0.2)'],
          borderWidth: 0,
          cutout: '70%',
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    };

    return (
      <main className="mt-5 w-[80vw] max-w-[33rem] h-[12rem] xs:h-[13rem] sm:h-[14rem] md:h-[15rem] rounded-2xl bg-white/10 border border-white/30 shadow-xl flex overflow-hidden mx-auto">
        <aside className="flex-shrink-0 flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 md:p-5 w-[30%] relative">
          <figure className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 relative">
            <Doughnut data={chartData} options={chartOptions} />
            <figcaption className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">{Math.round(percent)}%</span>
            </figcaption>
          </figure>
          <div className="mt-1 xs:mt-1.5 sm:mt-2 text-center">
            <span className="text-white text-xs xs:text-sm sm:text-sm opacity-80">{status}</span>
          </div>
        </aside>

        <section className="flex-1 text-black bg-accent p-2 xs:p-3 sm:p-4 md:p-5 flex flex-col justify-between">
          <header>
            <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-tight">{goal.title}</h2>
            <time className="text-xs xs:text-sm sm:text-sm md:text-base opacity-80">{goal.daysLeft}</time>
          </header>

          <article className="mt-1 xs:mt-2 text-xs xs:text-sm sm:text-base space-y-0.5 xs:space-y-1">
            <div className="flex justify-between">
              <dt className="opacity-80">Saved:</dt>
              <dd className="font-medium">{formatMoney(goal.amount)}</dd>
            </div>

            <div className="flex justify-between">
              <dt className="opacity-80">Target:</dt>
              <dd className="font-medium">{formatMoney(goal.total)}</dd>
            </div>

            <div className="flex justify-between">
              <dt className="opacity-80">Remaining:</dt>
              <dd className="font-medium">
                {formatMoney(remaining > 0 ? remaining : 0)}
              </dd>
            </div>
          </article>
        </section>
      </main>
    );
  };


export default GoalCardGlassMobile;
