"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"; 
import { PuffLoader } from "react-spinners";
import { CheckCircle, XCircle } from "lucide-react";
import { useSocket } from "@/contexts/SocketContext";

interface ComponentRow {
  name: string;
  status: "Offline" | "Online" | "Loading";
  icon?: string;
}

const ElectronicComponentsTable = () => {
  const socket = useSocket();

  const [components, setComponents] = useState<ComponentRow[]>([
    { name: "Ultrasonic Front", status: "Offline", icon: "/icons/ultrasonic.svg" },
    { name: "Ultrasonic Left", status: "Offline", icon: "/icons/ultrasonic.svg" },
    { name: "Ultrasonic Right", status: "Offline", icon: "/icons/ultrasonic.svg" },

    { name: "separator" }, // Separador visual

    { name: "Motor Front Left", status: "Offline", icon: "/icons/motor.svg" },
    { name: "Motor Front Right", status: "Offline", icon: "/icons/motor.svg" },
    { name: "Motor Rear Left", status: "Offline", icon: "/icons/motor.svg" },
    { name: "Motor Rear Right", status: "Offline", icon: "/icons/motor.svg" },

    { name: "separator" }, // Separador visual

    { name: "Motor Weapon", status: "Offline", icon: "/icons/motor.svg" },
  ]);

  // Todos componentes offline
  const setAllOffline = () => {
    setComponents((prev) =>
      prev.map((component) =>
        component.name === "separator" ? component : { ...component, status: "Offline" }
      )
    );
  };

  useEffect(() => {
    console.log("SysState: Conectando al server");

    if (!socket) {
      console.warn("ERR_socket_componentes");
      return;
    }

    const handleAvailabilityUpdate = (data: {
      motors: { FR: boolean; FL: boolean; RR: boolean; RL: boolean };
      sensors: { front: boolean; right: boolean; left: boolean };
    }) => {
      console.log("SysState_data:", data);

      setComponents((prev) =>
        prev.map((component) => {
          if (component.name === "separator") return component;

          let isOnline = false;
          switch (component.name) {
            case "Ultrasonic Front":
              isOnline = data.sensors.front;
              break;
            case "Ultrasonic Left":
              isOnline = data.sensors.left;
              break;
            case "Ultrasonic Right":
              isOnline = data.sensors.right;
              break;
            case "Motor Front Left":
              isOnline = data.motors.FL;
              break;
            case "Motor Front Right":
              isOnline = data.motors.FR;
              break;
            case "Motor Rear Left":
              isOnline = data.motors.RL;
              break;
            case "Motor Rear Right":
              isOnline = data.motors.RR;
              break;
            case "Motor Weapon":
              isOnline = data.motors.Weapon;
              break;
          }

          return { ...component, status: isOnline ? "Online" : "Offline" };
        })
      );
    };

    // Eventos ---------------------
    socket.on("availability_status", handleAvailabilityUpdate);
    socket.on("disconnect", () => {
      console.log("OFFLINE.");
      setAllOffline();
    });

    return () => {
      socket.off("availability_status", handleAvailabilityUpdate);
      socket.off("disconnect");
    };
  }, [socket]);

  return (
    <div className="w-full h-full mx-auto my-auto">
      {/* Tabla */}
      <Table>
        <TableHeader className="font-extrabold text-base text-orbitron">
          <TableRow>
            <TableHead>Component</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component, index) =>
            component.name === "separator" ? (
              <TableRow key={index}>
                <TableCell colSpan={2} className="p-0 h-0.5 border-transparent bg-zinc-900 border-none"></TableCell>
              </TableRow>
            ) : (
              <TableRow key={index}>
                <TableCell className="flex items-center gap-2">
                  {component.icon && (
                    <Image
                      src={component.icon}
                      alt={component.name}
                      width={26}
                      height={26}
                      className={`transition-all duration-300 ${
                        component.status === "Online" ? "filter-hacker" : "filter-white"
                      }`}
                    />
                  )}
                  <span
                    className={`font-medium text-sm transition-all duration-300 text-orbitron ${
                      component.status === "Online"
                        ? "text-[var(--hacker-green)]"
                        : "text-zinc-900"
                    }`}
                  >
                    {component.name}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                      component.status === "Offline"
                        ? "text-[var(--warning)]"
                        : component.status === "Online"
                        ? "text-[var(--hacker-green)]"
                        : "text-[var(--loading)]"
                    }`}
                  >
                    {component.status === "Loading" ? (
                      <>
                        <PuffLoader size={18} color={"#4169E1"} />
                        Loading
                      </>
                    ) : component.status === "Online" ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-[var(--hacker-green)] text-lg " /> Online
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-[var(--warning)]" /> Offline
                      </>
                    )}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ElectronicComponentsTable;
