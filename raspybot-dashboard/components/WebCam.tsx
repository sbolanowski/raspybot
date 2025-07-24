"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";

const WebCam = () => {
  const socket = useSocket();
  const [imageSrc, setImageSrc] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      setIsSocketConnected(false);
      return;
    }

    const handleConnect = () => {
      console.log("WEBCAM: Conectado al server");
      setIsSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.warn("WEBCAM: Desconectado del server");
      setIsSocketConnected(false);
    };

    const handleError = (error) => {
      console.error("WEBCAM: Error de conexión:", error);
      setIsSocketConnected(false);
    };

    const handleVideoFrame = (data) => {
      if (!data?.frame) {
        console.error("Frame inválido (jpeg?/base64?):", data);
        return;
      }

      setImageSrc(`data:image/jpeg;base64,${data.frame}`);
    };

    // Eventos ---------------------
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);
    socket.on("video_frame", handleVideoFrame);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.off("video_frame", handleVideoFrame);
    };
  }, [socket]);

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center">
      {/* Overlay no conex. */}
      {(!isSocketConnected || imageSrc == "") && (
        <div className="w-full h-full absolute inset-0 flex justify-center items-center bg-blend-darken backdrop-blur-sm text-3xl font-bold text-orbitron text-hacker-green">
          NO VIDEO FEED
        </div>
      )}

      {/* Webcam Stream */}
      <div className="bg-black p-2 border border-zinc-900 rounded-xl">
        <p className="text-sm text-orbitron text-hacker-green mb-2">
          Webcam Stream
        </p>
        <img
          src={imageSrc}
          alt="Webcam Stream"
          className="rounded-xl w-[392px] h-[294px] object-contain"
        />
      </div>
    </div>
  );
};

export default WebCam;