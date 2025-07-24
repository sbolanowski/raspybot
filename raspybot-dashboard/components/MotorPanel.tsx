"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronsUp, ChevronsDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

import BarChart from "@/components/BarChart";
import MotorLineChart from "@/components/MotorLineChart";


import WebCam from "@/components/WebCam";

import { useSocket } from "@/contexts/SocketContext";

import Image from "next/image";

const motores = [
  { id: 1, nombre: "A" },
  { id: 2, nombre: "B" },
  { id: 3, nombre: "C" },
  { id: 4, nombre: "D" },
];

export default function MotorPanel() {
  const socket = useSocket();

  // useState individual para cada motor
  const [motorA, setMotorA] = useState(0);
  const [motorB, setMotorB] = useState(0);
  const [motorC, setMotorC] = useState(0);
  const [motorD, setMotorD] = useState(0);

  // Filtros de los motores
  const [filtroA, setFiltroA] = useState("filter-white");
  const [filtroB, setFiltroB] = useState("filter-white");
  const [filtroC, setFiltroC] = useState("filter-white");
  const [filtroD, setFiltroD] = useState("filter-white");

  const timeoutsRef = useRef<(NodeJS.Timeout | null)[]>(Array(motores.length).fill(null));

  const [delay, setDelay] = useState(1000);

  const [isArmed, setIsArmed] = useState(false);

  const handleWeaponClick = () => {
    setIsArmed(true);

    if (!socket) {
      console.warn("ERR_SOCKET!");
      return;
    }
    socket.emit("set_motors", "WEAPON");

    setTimeout(() => {
      setIsArmed(false);
    }, delay);
  };

  useEffect(() => {
    if (!socket) return;

    const handleMotorData = (data: { FR?: number; FL?: number; RR?: number; RL?: number }) => {
      if (data.FR !== 0) activarMotor("B", data.FR > 0 ? "up" : "down");
      if (data.FL !== 0) activarMotor("A", data.FL > 0 ? "up" : "down");
      if (data.RR !== 0) activarMotor("D", data.RR > 0 ? "up" : "down");
      if (data.RL !== 0) activarMotor("C", data.RL > 0 ? "up" : "down");
    };

    // Eventos ---------------------
    socket.on("motor_data", handleMotorData);

    return () => {
      socket.off("motor_data", handleMotorData);
    };
  }, [socket]);




 // Activar / Desactivar motor individualmente
 const activarMotor = (motor: string, direccion: "up" | "down") => {
    const nuevaAccion = direccion === "up" ? 1 : -1;

    switch (motor) {
      case "A":
        if (motorA === nuevaAccion) return;

        setMotorA(nuevaAccion);
        setFiltroA("filter-hacker");

        clearTimeout(timeoutsRef.current[0]!);

        timeoutsRef.current[0] = setTimeout(() => {
          setMotorA(0);
          setFiltroA("filter-white");
        }, delay);
        break;

      case "B":
        if (motorB === nuevaAccion) return;

        setMotorB(nuevaAccion);
        setFiltroB("filter-hacker");

        clearTimeout(timeoutsRef.current[1]!);

        timeoutsRef.current[1] = setTimeout(() => {
          setMotorB(0);
          setFiltroB("filter-white");
        }, delay);
        break;

      case "C":
        if (motorC === nuevaAccion) return;

        setMotorC(nuevaAccion);
        setFiltroC("filter-hacker");

        clearTimeout(timeoutsRef.current[2]!);

        timeoutsRef.current[2] = setTimeout(() => {
          setMotorC(0);
          setFiltroC("filter-white");
        }, delay);
        break;

      case "D":
        if (motorD === nuevaAccion) return;

        setMotorD(nuevaAccion);
        setFiltroD("filter-hacker");

        clearTimeout(timeoutsRef.current[3]!);

        timeoutsRef.current[3] = setTimeout(() => {
          setMotorD(0);
          setFiltroD("filter-white");
        }, delay);
        break;
      default:
        return;
    }
  };


  // Detener todos los motores
  const detenerTodosMotores = () => {
    console.log("MOTORES: Deteniendo...");

    setMotorA(0);
    setMotorB(0);
    setMotorC(0);
    setMotorD(0);

    setFiltroA("filter-white");
    setFiltroB("filter-white");
    setFiltroC("filter-white");
    setFiltroD("filter-white");

    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));

    timeoutsRef.current = [];
  };


  // ===============================================
  // Funciones para controlar todos los motores   ||
  // ===============================================

  const UP_MOVEMENT = () => {
    // LEFT SECTOR
    activarMotor("A", "up");
    activarMotor("C", "up");
  
    // RIGHT SECTOR
    activarMotor("B", "up");
    activarMotor("D", "up");
  
    activateMotors(1, 1, 1, 1); // Mueve todos los motores hacia adelante
  };
  
  const DOWN_MOVEMENT = () => {
    // LEFT SECTOR
    activarMotor("A", "down");
    activarMotor("C", "down");
  
    // RIGHT SECTOR
    activarMotor("B", "down");
    activarMotor("D", "down");
  
    activateMotors(-1, -1, -1, -1); // Mueve todos los motores hacia atrás
  };
  
  // ============================================
  
  const LEFT_MOVEMENT = () => {
    // LEFT SECTOR
    activarMotor("A", "down");
    activarMotor("C", "up");
  
    // RIGHT SECTOR
    activarMotor("B", "up");
    activarMotor("D", "down");
  
    activateMotors(-1, 1, 1, -1); // Giro hacia la izquierda
  };
  
  const RIGHT_MOVEMENT = () => {
    // LEFT SECTOR
    activarMotor("A", "up");
    activarMotor("C", "down");
  
    // RIGHT SECTOR
    activarMotor("B", "down");
    activarMotor("D", "up");
  
    activateMotors(1, -1, -1, 1); // Giro hacia la derecha
  };
  
  // ======================================
  
  const UPPER_LEFT_MOVEMENT = () => {
    // LEFT SECTOR
    activarMotor("C", "up");
  
    // RIGHT SECTOR
    activarMotor("B", "up");
  
    activateMotors(0, 1, 1, 0); // Movimiento diagonal arriba a la izquierda
  };
  
  const UPPER_RIGHT_MOVEMENT = () => {
    // LEFT SECTOR
    activarMotor("A", "up");
  
    // RIGHT SECTOR
    activarMotor("D", "up");
  
    activateMotors(1, 0, 0, 1); // Movimiento diagonal arriba a la derecha
  };
  
  // ======================================
  
  const LOWER_LEFT_MOVEMENT = () => {
    // LEFT SECTOR
    activarMotor("A", "down");
  
    // RIGHT SECTOR
    activarMotor("D", "down");
  
    activateMotors(-1, 0, 0, -1); // Movimiento diagonal abajo a la izquierda
  };
  
  const LOWER_RIGHT_MOVEMENT = () => {
    // LEFT SECTOR
    activarMotor("B", "down");
  
    // RIGHT SECTOR
    activarMotor("C", "down");
  
    activateMotors(0, -1, -1, 0); // Movimiento diagonal abajo a la derecha
  };
  
  // =====================================
  
  const CLOCKWISE_MOVEMENT = () => {
    // LEFT SECTOR
    activarMotor("A", "up");
    activarMotor("C", "up");
  
    // RIGHT SECTOR
    activarMotor("B", "down");
    activarMotor("D", "down");
  
    activateMotors(1, -1, 1, -1); // Rotación en sentido horario
  };
  
  const ANTICLOCKWISE_MOVEMENT = () => {
    // LEFT SECTOR
    activarMotor("A", "down");
    activarMotor("C", "down");
  
    // RIGHT SECTOR
    activarMotor("B", "up");
    activarMotor("D", "up");
  
    activateMotors(-1, 1, -1, 1); // Rotación en sentido antihorario
  };
  
  // =====================================



  const [botonActivo, setBotonActivo] = useState<string | null>(null);

  // Lista de movimientos en orden
  const movimientos = [
    { fn: UPPER_LEFT_MOVEMENT, alt: "UP LEFT" },
    { fn: LOWER_RIGHT_MOVEMENT, alt: "LOW RIGHT" },

    { fn: UPPER_RIGHT_MOVEMENT, alt: "UP RIGHT" },
    { fn: LOWER_LEFT_MOVEMENT, alt: "LOW LEFT" },

    { fn: UP_MOVEMENT, alt: "UP" },
    { fn: DOWN_MOVEMENT, alt: "DOWN" },
    
    { fn: LEFT_MOVEMENT, alt: "LEFT" },
    { fn: RIGHT_MOVEMENT, alt: "RIGHT" },
    
    { fn: ANTICLOCKWISE_MOVEMENT, alt: "ANTICLOCK" },
    { fn: CLOCKWISE_MOVEMENT, alt: "CLOCK" },

    { fn: detenerTodosMotores, alt: "STOP" },
  ];

  const ejecutarTest = () => {
    movimientos.forEach((mov, index) => {
      setTimeout(() => {
        setBotonActivo(mov.alt);
        mov.fn();
  
        setTimeout(() => {
          setBotonActivo(null);
        }, delay - 100);
  
      }, index * delay);
    });
  };
  
  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      let movimientoSeleccionado = null;
  
      switch (event.key.toLowerCase()) {
        case "q":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "UP LEFT");
          break;
        case "w":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "UP");
          break;
        case "e":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "UP RIGHT");
          break;
        case "a":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "LEFT");
          break;
        case "s":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "DOWN");
          break;
        case "d":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "RIGHT");
          break;
        case "z":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "LOW LEFT");
          break;
        case "c":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "LOW RIGHT");
          break;
        case "r":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "ANTICLOCK");
          break;
        case "t":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "CLOCK");
          break;
        case "x":
          handleWeaponClick();
          break;
        case " ":
          movimientoSeleccionado = movimientos.find((m) => m.alt === "STOP");
          break;
        default:
          return;
      }
  
      if (movimientoSeleccionado) {
        setBotonActivo(movimientoSeleccionado.alt);
        movimientoSeleccionado.fn();
  
        setTimeout(() => {
          setBotonActivo(null);
        }, delay - 100);
      }
    };
  
    window.addEventListener("keydown", handleKeyPress);
  
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [delay]);
  

  useEffect(() => {
    if (!socket) {
      console.warn("ERR_SOCKET");
      return;
    }

    socket.on("connect", () => {
      console.log("MOTOR_PANEL: Conectado al server");
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);



const activateMotors = (FL: number, FR: number, RL: number, RR: number) => {
  if (!socket) {
    console.warn("ERR_activateMotors");
    return;
  }

  const command = `${FL},${FR},${RL},${RR}`;
  socket.emit("set_motors", command);

  setTimeout(() => {
    socket.emit("set_motors", "STOP");
  }, delay-100);
};



  return (
    <div className="w-full h-full text-foreground bg-black flex justify-center items-center">

        {/* MOTORS DATA ==================================== */}
        <div className="w-8/12 h-full p-2">

            <div className="grid grid-cols-2 gap-4 w-full my-2">
                {/* Sección de Motores */}
                {motores.map((motor, index) => {
                let activacion, filtroActivo;
                switch (motor.id) {
                    case 1:
                    activacion = motorA;
                    filtroActivo = filtroA;
                    break;
                    case 2:
                    activacion = motorB;
                    filtroActivo = filtroB;
                    break;
                    case 3:
                    activacion = motorC;
                    filtroActivo = filtroC;
                    break;
                    case 4:
                    activacion = motorD;
                    filtroActivo = filtroD;
                    break;
                    default:
                    activacion = 0;
                    filtroActivo = "filter-white";
                }


                return (
                    <Card key={motor.id} className="bg-black border-zinc-900 flex flex-row gap-0 p-4">
                    
                    {/* Boton test individual */}
                    {(index === 0 || index === 2) && (
                        <>
                        <div className="w-1/12 flex flex-col justify-end gap-1 m-1 py-0">
                        <Button
                            onClick={() => activarMotor(motor.nombre, "up")}
                            className="p-2 bg-zinc-950 text-hacker cursor-pointer"
                        >
                            <ChevronUp size={20} />
                        </Button>

                        

                        <Button
                            onClick={() => activarMotor(motor.nombre, "down")}
                            className="p-2 bg-zinc-950 text-hacker cursor-pointer"
                        >
                            <ChevronDown size={20} />
                        </Button>
                        </div>
                    </>
                    )}


                    {/* Gráfico de barras */}
                    {(index === 1 || index === 3) && (
                        <>
                        <div className="w-1/6 h-full flex items-center">
                            <BarChart activacion={activacion} motorNombre={motor.nombre} />
                        </div>
                        <div className="w-1/12 h-full flex items-center justify-center">
                            <div
                            className={`absolute ${
                            activacion === 1 ? "animate-bounce-up" : ""
                            } ${activacion === -1 ? "animate-bounce-down" : ""}`}
                            >
                            {activacion === 1 ? (
                            <ChevronsUp size={36} className="text-[var(--hacker-green)]" />
                            ) : activacion === -1 ? (
                            <ChevronsDown size={36} className="text-[var(--hacker-green)]" />
                            ) : null}
                            </div>
                        </div>
                        </>
                    )}

                    {/* ====================================================== */}

                    {/* IMG Motor */}
                    <div className="w-4/6 h-full rounded-md flex items-center justify-center relative">
                        <Image
                            src="/icons/dc-motor.svg"
                            alt={`Motor ${motor.nombre}`}
                            fill={true}
                            className={`object-contain ${filtroActivo} ${
                            index % 2 === 1 ? "scale-x-[-1]" : ""
                            }`}
                        />
                    </div>

                    {/* ====================================================== */}

                    {/* Boton test individual */}
                    {(index === 1 || index === 3) && (
                    <>
                        <div className="w-1/12 flex flex-col justify-end gap-1">
                        <Button
                            onClick={() => activarMotor(motor.nombre, "up")}
                            className="p-2 bg-zinc-950 text-hacker cursor-pointer"
                        >
                            <ChevronUp size={20} />
                        </Button>

                        

                        <Button
                            onClick={() => activarMotor(motor.nombre, "down")}
                            className="p-2 bg-zinc-950 text-hacker cursor-pointer"
                        >
                            <ChevronDown size={20} />
                        </Button>
                        </div>
                    </>
                    )}


                    {/* Gráfico de barras */}
                    {(index === 0 || index === 2) && (
                    <>
                        <div className="w-1/12 h-full flex items-center justify-center">
                        <div
                            className={`absolute ${
                            activacion === 1 ? "animate-bounce-up" : ""
                            } ${activacion === -1 ? "animate-bounce-down" : ""}`}
                        >
                            {activacion === 1 ? (
                            <ChevronsUp size={36} className="text-[var(--hacker-green)]" />
                            ) : activacion === -1 ? (
                            <ChevronsDown size={36} className="text-[var(--hacker-green)]" />
                            ) : null}
                        </div>
                        </div>
                        <div className="w-1/6 h-full flex items-center">
                        <BarChart activacion={activacion} motorNombre={motor.nombre} />
                        </div>
                    </>
                    )}
                    </Card>
                );
                })}
            </div>

            <MotorLineChart
            motorA={motorA}
            motorB={motorB}
            motorC={motorC}
            motorD={motorD}
            />

        </div>


      {/* MOTORS ACTIONS AND WEAPON ======================== */}
      <div className="w-4/12 h-full p-2 flex flex-col justify-center">

        <div className="h-1/3 flex flex-col justify-center items-center mx-auto my-auto mb-2">
          <WebCam/>
        </div>
        <div className="h-1/3 flex justify-center flex-col">
          <Card className="bg-black border-zinc-900 block gap-0 p-4">
            
            {/* Imagen del motor */}
            <div className="my-auto mx-auto flex items-center justify-center">
              <Image
                src="/icons/weapon-dc-motor.svg"
                alt="Motor hélice"
                width={125}
                height={125}
                className={`object-contain transition-all duration-500 ${
                  isArmed ? "filter-hacker" : "filter-white"
                }`}
              />
            </div>

            {/* Botón WEAPON + Indicadores SAFE/ARMED */}
            <div className="w-full h-1/4 flex justify-around items-center gap-2">
              
              {/* Botón WEAPON */}
              <Button
                onClick={handleWeaponClick}
                className="w-2/4 stripes bg-black border rounded-md border-black text-hacker-green text-orbitron"
              >
                <p className="bg-black px-4 py-1 border rounded-md border-black text-hacker-green">WEAPON</p>
              </Button>

              {/* SAFE / ARMED */}
              <div className="w-1/4 block border rounded-md overflow-hidden border-zinc-900">
                <div
                  className={`flex justify-center text-orbitron font-extrabold transition-all duration-500 py-1 px-2 ${
                    isArmed ? "bg-black text-zinc-800" : "bg-[var(--hacker-green)]"
                  }`}
                >
                  SAFE
                </div>
                <div
                  className={`flex justify-center text-orbitron font-extrabold transition-all duration-500 py-1 px-2 ${
                    isArmed ? "bg-[var(--warning)]" : "bg-black text-zinc-800"
                  }`}
                >
                  ARMED
                </div>
              </div>
            </div>
          </Card>

          <div className="max-w-lg mx-auto mb-4 flex flex-col items-center">
            <p className="font-semibold text-[var(--hacker-green)]">Command duration: {delay} ms</p>
            <Slider
              defaultValue={[500]}
              min={500}
              max={5000}
              step={500}
              onValueChange={(value) => setDelay(value[0])}
              className="w-full "
              //rangeClassName="bg-[var(--hacker-green)]" 
            />
          </div>
        </div>

        <div className="h-1/3 flex justify-center items-center mx-auto my-auto">
          {/* Botonera principal de control */}
          <div className="grid grid-cols-3 gap-3 p-4 h-2/3">

            <Button onClick={UPPER_LEFT_MOVEMENT}  className={`p-2 ${botonActivo === "UP LEFT" ? "bg-transparent border border-[var(--hacker-green)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
              <Image src="/icons/arrow.svg" alt="UP LEFT" width={24} height={24} className="filter-hacker rotate-315" />
            </Button>

            <Button onClick={UP_MOVEMENT}  className={`p-2 ${botonActivo === "UP" ? "bg-transparent border border-[var(--hacker-green)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
              <Image src="/icons/arrow.svg" alt="UP" width={36} height={36} className="filter-hacker" />
            </Button>

            <Button onClick={UPPER_RIGHT_MOVEMENT}  className={`p-2 ${botonActivo === "UP RIGHT" ? "bg-transparent border border-[var(--hacker-green)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
              <Image src="/icons/arrow.svg" alt="UP RIGHT" width={24} height={24} className="filter-hacker rotate-45" />
            </Button>



            <Button onClick={LEFT_MOVEMENT} className={`p-2 ${botonActivo === "LEFT" ? "bg-transparent border border-[var(--hacker-green)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
              <Image src="/icons/arrow.svg" alt="LEFT" width={36} height={36} className="filter-hacker rotate-270" />
            </Button>

            <Button onClick={detenerTodosMotores} className={`p-2 ${botonActivo === "STOP" ? "bg-transparent border border-[var(--warning)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
              <Image src="/icons/stop.svg" alt="STOP" width={32} height={32} className="filter-warning" />
            </Button>

            <Button onClick={RIGHT_MOVEMENT}  className={`p-2 ${botonActivo === "RIGHT" ? "bg-transparent border border-[var(--hacker-green)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
              <Image src="/icons/arrow.svg" alt="RIGHT" width={36} height={36} className="filter-hacker rotate-90" />
            </Button>



            <Button onClick={LOWER_LEFT_MOVEMENT}   className={`p-2 ${botonActivo === "LOW LEFT" ? "bg-transparent border border-[var(--hacker-green)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
              <Image src="/icons/arrow.svg" alt="LOW LEFT" width={24} height={24} className="filter-hacker rotate-225" />
            </Button>

            <Button onClick={DOWN_MOVEMENT}  className={`p-2 ${botonActivo === "DOWN" ? "bg-transparent border border-[var(--hacker-green)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
              <Image src="/icons/arrow.svg" alt="DOWN" width={36} height={36} className="filter-hacker rotate-180" />
            </Button>

            <Button onClick={LOWER_RIGHT_MOVEMENT}   className={`p-2 ${botonActivo === "LOW RIGHT" ? "bg-transparent border border-[var(--hacker-green)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
              <Image src="/icons/arrow.svg" alt="LOW RIGHT" width={24} height={24} className="filter-hacker rotate-135" />
            </Button>

          </div>


          {/* Botonera secundaria de control */}
            <div className="grid grid-cols-2 gap-3 p-4 h-1/3">

                <Button onClick={ANTICLOCKWISE_MOVEMENT} className={`p-2 ${botonActivo === "ANTICLOCK" ? "bg-transparent border border-[var(--hacker-green)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
                    <Image src="/icons/rotate.svg" alt="ANTICLOCK" width={42} height={42} className="filter-hacker scale-x-[-1]" />
                </Button>

                <Button onClick={CLOCKWISE_MOVEMENT} className={`p-2 ${botonActivo === "CLOCK" ? "bg-transparent border border-[var(--hacker-green)]" : "bg-zinc-950"} text-hacker cursor-pointer`}>
                    <Image src="/icons/rotate.svg" alt="CLOCK" width={42} height={42} className="filter-hacker" />
                </Button>

                {/* Botón de Test centrado abajo */}
                <div className="col-span-2 flex justify-center">
                    <Button onClick={ejecutarTest} className="p-2 bg-zinc-950 text-hacker cursor-pointer">
                        <Image src="/icons/test.svg" alt="TEST" width={64} height={64} className="filter-hacker" />
                    </Button>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}
