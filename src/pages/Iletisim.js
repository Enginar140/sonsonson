import React, { useEffect, useRef, useState } from "react";
import "../styles/global.css";
import "../styles/components/iletisim.css";

function Iletisim() {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectWebSocket = () => {
      console.log("WebSocket bağlantısı başlatılıyor...");
      socketRef.current = new WebSocket("ws://localhost:5004");

      socketRef.current.onopen = () => {
        console.log("WebSocket bağlantısı başarılı!");
        setIsConnected(true);
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket bağlantı hatası:", error);
        setTimeout(connectWebSocket, 5004); // 5 saniye sonra yeniden dene
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket bağlantısı kapandı.");
        setIsConnected(false);
        setTimeout(connectWebSocket, 5004); // Bağlantı kesildiğinde yeniden dene
      };

      socketRef.current.onmessage = (event) => {
        if (!canvasRef.current) return;

        const arrayBuffer = event.data;
        const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
        const imageUrl = URL.createObjectURL(blob);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          if (!canvasRef.current) return;
          console.log("Yeni bir frame yüklendi.");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(imageUrl); // Bellek temizleme
        };
        img.src = imageUrl;
      };
    };

    setTimeout(connectWebSocket, 1000); // WebSocket bağlantısını 1 saniye sonra başlat

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        console.log("WebSocket bağlantısı kapatıldı.");
      }
    };
  }, []);

  return (
    <div className="video-container">
      <h1>Video Akışı</h1>
      <div>{isConnected ? "Bağlantı başarılı!" : "Bağlantı kuruluyor..."}</div>
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
}

export default Iletisim;
