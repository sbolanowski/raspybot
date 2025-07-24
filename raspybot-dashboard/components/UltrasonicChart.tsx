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

const sensorLabels = ["Ultrasonic Front", "Ultrasonic Left", "Ultrasonic Right"];

const UltrasonicChart = () => {
  const socket = useSocket();
  const [history, setHistory] = useState<number[][]>([[], [], []]);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!socket) {
      setIsSocketConnected(false);
      return;
    }
  
    const handleConnect = () => {
      console.log("Ultrasónicos: Conectado al server");
      setIsSocketConnected(true);
    };
  
    const handleDisconnect = () => {
      console.warn("Ultrasónicos: Desconectado del server");
      setIsSocketConnected(false);
    };
  
    const handleError = (error: any) => {
      console.error("Ultrasónicos: Error de conexión:", error);
      setIsSocketConnected(false);
    };
  
    const handleUltrasonicData = (data: { front?: number; left?: number; right?: number }) => {
      if (!data || typeof data.front !== "number" || typeof data.left !== "number" || typeof data.right !== "number") {
        console.error("❌ Datos de ultrasonido inválidos:", data);
        return;
      }
  
      setHistory((prev) => [
        [...prev[0], data.front].slice(-40),
        [...prev[1], data.left].slice(-40),
        [...prev[2], data.right].slice(-40),
      ]);
    };
  
    // Eventos ---------------------
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);
    socket.on("ultrasonic_data", handleUltrasonicData);
  
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.off("ultrasonic_data", handleUltrasonicData);
    };
  }, [socket]);

  const getSensorColor = (value: number) => {
    if (value < 0.20) {
      return "#FF0000"; // Rojo
    } else if (value >= 0.20 && value <= 0.30) {
      return "#FFFF00"; // Amarillo
    }
    return "#00e68a"; // Verde
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      y: {
        min: 0,
        max: 2,
        ticks: {
          stepSize: 0.1,
          callback: (value) => `${value} m`,
        },
        grid: {
          color: (ctx) =>
            ctx.tick.value === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.1)",
          lineWidth: (ctx) => (ctx.tick.value === 0 ? 2 : 1),
        },
      },
      x: { display: false },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div className="relative w-full h-full mx-auto my-auto flex flex-col justify-center items-center">
      {/* Overlay no conex. */}
      {!isSocketConnected && (
        <div className="absolute inset-0 flex justify-center items-center bg-transparent backdrop-blur-sm text-3xl font-bold text-orbitron text-hacker-green">
          NO DATA AVAILABLE
        </div>
      )}

      {/* ULTRASONIC FRONT */}
      <div className="mb-4 h-1/2 w-full">
        <div className="bg-black p-2 border border-zinc-900 rounded-xl flex flex-col">
          <p className="text-sm text-orbitron text-hacker-green mb-2">{sensorLabels[0]}</p>
          <div className="flex-1">
            <Line
              data={{
                labels: Array(history[0].length).fill(""),
                datasets: [
                  {
                    data: history[0],
                    borderColor: getSensorColor(history[0][history[0].length - 1]),
                    backgroundColor: `${getSensorColor(history[0][history[0].length - 1])}20`,
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 2,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      {/* ULTRASONIC LEFT & RIGHT */}
      <div className="grid grid-cols-2 gap-4 h-1/2 w-full">
        {history.slice(1).map((data, index) => (
          <div
            key={index + 1}
            className="bg-black p-2 border border-zinc-900 rounded-xl flex flex-col"
          >
            <p className="text-sm text-orbitron text-hacker-green mb-2">
              {sensorLabels[index + 1]}
            </p>
            <div className="flex-1">
              <Line
                data={{
                  labels: Array(data.length).fill(""),
                  datasets: [
                    {
                      data,
                      borderColor: getSensorColor(data[data.length - 1]),
                      backgroundColor: `${getSensorColor(data[data.length - 1])}20`,
                      tension: 0.4,
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
    </div>
  );
};

export default UltrasonicChart;