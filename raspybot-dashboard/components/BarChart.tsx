"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartOptions,
  ChartData,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement);

interface BarChartProps {
  activacion: number;
  motorNombre: string;
}

const BarChart: React.FC<BarChartProps> = ({ activacion, motorNombre }) => {
  const [barColor, setBarColor] = useState("#00FF00");

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const hackerGreen = rootStyles.getPropertyValue("--color-hacker-green").trim();
    if (hackerGreen) {
      setBarColor(hackerGreen);
    }
  }, []);

  const data: ChartData<"bar", number[], string> = {
    labels: [motorNombre],
    datasets: [
      {
        data: [activacion],
        backgroundColor: barColor,
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 40,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: -1,
        max: 1,
        grid: {
          drawTicks: false,
          color: (ctx) =>
            ctx.tick.value === 0 ? barColor : "rgba(255,255,255,0.1)",
          lineWidth: (ctx) => (ctx.tick.value === 0 ? 2 : 1),
        },
        ticks: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="w-full h-full ">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
