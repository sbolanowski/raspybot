"use client";

import ElectronicComponentsTable from "@/components/ElectronicComponentTable";
import UltrasonicChart from "@/components/UltrasonicChart";

import MotorPanel from "@/components/MotorPanel";

export default function Home() {

  return (
    <div className="h-screen w-full text-foreground bg-black overflow-y-hidden">

      <h1 className="text-4xl font-bold text-center text-[var(--hacker-green)] mb-5 tittle my-auto">
        RasPyBot  &nbsp; Dashboard
      </h1>

      <div className="flex justify-center my-auto mx-auto items-center">
        
        <div className="w-8/12 h-full">
          <MotorPanel/>
        </div>
        
        <div className="w-4/12 h-full p-2">
          <div className="flex flex-col">
            <div className="h-1/2">
              <UltrasonicChart/>
            </div>
            <div className="h-1/2">
              <ElectronicComponentsTable/>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}