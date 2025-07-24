"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useSocket } from "@/contexts/SocketContext";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ChartOptions,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

interface MotorLineChartProps {
  motorA: number;
  motorB: number;
  motorC: number;
  motorD: number;
}

const motoresLabels = ["Front Left", "Front Right", "Rear Left", "Rear Right"];

const MotorLineChart = () => {
  const socket = useSocket();
  const [motors, setMotors] = useState({
    FR: 0,
    FL: 0,
    RR: 0,
    RL: 0,
  });
  const [history, setHistory] = useState<number[][]>([[], [], [], []]);
  const [lineColor, setLineColor] = useState("#00FF00");

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const hackerGreen = rootStyles.getPropertyValue("--color-hacker-green").trim();

    if (hackerGreen) {
      setLineColor(hackerGreen);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMotorData = (data: {
      FR?: number;
      FL?: number;
      RR?: number;
      RL?: number;
    }) => {
      setMotors({
        FR: data.FR ?? motors.FR,
        FL: data.FL ?? motors.FL,
        RR: data.RR ?? motors.RR,
        RL: data.RL ?? motors.RL,
      });
    };

    // Eventos ---------------------
    socket.on("motor_data", handleMotorData);

    return () => {
      socket.off("motor_data", handleMotorData);
    };
  }, [socket, motors]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => [
        [...prev[0], motors.FL].slice(-20),
        [...prev[1], motors.FR].slice(-20),
        [...prev[2], motors.RL].slice(-20),
        [...prev[3], motors.RR].slice(-20),
      ]);
    }, 100);

    return () => clearInterval(interval);
  }, [motors]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: -1,
        max: 1,
        grid: {
          drawTicks: false,
          color: (ctx) =>
            ctx.tick.value === 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)",
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
      legend: { display: false },
    },
  };

  return (
    <div className="grid mx-auto grid-cols-2 gap-4 mx-auto">
      {history.map((data, index) => (
        <div
          key={index}
          className="h-48 w-full bg-black p-2 border border-zinc-900 rounded-xl flex flex-col"
        >
          <p className="text-sm text-[var(--hacker-green)] font-mono mb-2 text-orbitron">
            {motoresLabels[index]}
          </p>
          <div className="flex-1">
            <Line
              data={{
                labels: Array(data.length).fill(""),
                datasets: [
                  {
                    data,
                    borderColor: lineColor,
                    backgroundColor: "rgba(0,255,0,0.1)",
                    tension: 0.45,
                    pointRadius: 0,
                    borderWidth: 2,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MotorLineChart;