import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";
import "../styles/components/telemetry.css";

const Telemetry = () => {
  const [telemetryData, setTelemetryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const [streamStatus, setStreamStatus] = useState("stopped");
  const [telemetryError, setTelemetryError] = useState(false);
  const [signalLost, setSignalLost] = useState(false); // New state to track signal loss

  const fetchTelemetry = async () => {
    // FPS ve Yayın durumu
    try {
      const statsRes = await axios.get("http://127.0.0.1:5004/stats");
      setFps(statsRes.data.fps);
      setStreamStatus(statsRes.data.status);
      if (statsRes.data.status !== "running") {
        setSignalLost(true); // If status is not running, signal is lost
      } else {
        setSignalLost(false); // Signal is back if the stream is running
      }
    } catch (err) {
      console.warn("Video istatistik alınamadı:", err.message);
    }

    // Telemetri verisi
    try {
      const telemetryRes = await axios.get("http://127.0.0.1:5000/telemetry");
      setTelemetryData(telemetryRes.data);
      setTelemetryError(false);
      setLoading(false);
    } catch (err) {
      console.error("Telemetri alınamadı:", err.message);
      setTelemetryError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(interval);
  }, []);

  const startServer = async () => {
    try {
      await axios.post("http://127.0.0.1:5004/start");
      setStreamStatus("running");
    } catch (err) {
      console.error("Sunucu başlatma hatası:", err.message);
    }
  };

  const stopServer = async () => {
    try {
      await axios.post("http://127.0.0.1:5004/stop");
      setStreamStatus("stopped");
    } catch (err) {
      console.error("Sunucu durdurma hatası:", err.message);
    }
  };

  return (
    <div className="telemetry-wrapper">
      {/* Video Yayını */}
      <div className="telemetry-container green-container">
        <div className="stream-header">
          <h3>CANLI GÖRÜNTÜ</h3>
          <div className="stream-controls">
            <button
              onClick={startServer}
              disabled={streamStatus === "running"}
              className="control-btn start-btn"
            >
              Başlat
            </button>
            <button
              onClick={stopServer}
              disabled={streamStatus !== "running"}
              className="control-btn stop-btn"
            >
              Durdur
            </button>
          </div>
        </div>

        <div className="video-stream-container">
          <div className={`stream-status ${streamStatus}`}>
            {streamStatus === "running" ? (
              <span>Yayın Aktif (FPS: {fps.toFixed(1)})</span>
            ) : (
              <span>Yayın Kapalı</span>
            )}
          </div>

          {/* Handle signal lost state */}
          {signalLost ? (
            <div className="stream-placeholder">
              <span>Sinyal Kesildi</span>
              <img
                src="http://127.0.0.1:5004/video_feed"
                alt="Canlı Görüntü"
                className="video-stream"
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              />
            </div>
          ) : streamStatus === "running" ? (
            <img
              src="http://127.0.0.1:5004/video_feed"
              alt="Canlı Görüntü"
              className="video-stream"
              style={{ width: "100%", height: "auto", borderRadius: "8px" }}
            />
          ) : (
            <div className="stream-placeholder">Görüntü akışı kapalı.</div>
          )}
        </div>
      </div>

      {/* Telemetri */}
      <div className="telemetry-container red-container">
        <h3>TELEMETRİ VERİLERİ</h3>

        {loading ? (
          <div className="status-message loading">Veriler yükleniyor...</div>
        ) : telemetryError ? (
          <div className="status-message warning">
            Telemetri bağlantısı kesildi. Son veriler gösteriliyor.
          </div>
        ) : null}

        {telemetryData && (
          <div className="telemetry-grid">
            <div className="telemetry-item">
              <span className="label">Takım No:</span>
              <span className="value">{telemetryData.takim_numarasi}</span>
            </div>
            <div className="telemetry-item">
              <span className="label">Hedef Konum:</span>
              <span className="value">
                {telemetryData.hedef_merkez_X}, {telemetryData.hedef_merkez_Y}
              </span>
            </div>
            <div className="telemetry-item">
              <span className="label">Hedef Boyut:</span>
              <span className="value">
                {telemetryData.hedef_genislik}x{telemetryData.hedef_yukseklik}
              </span>
            </div>
            <div className="telemetry-item">
              <span className="label">Konum:</span>
              <span className="value">
                {telemetryData.iha_enlem}, {telemetryData.iha_boylam}
              </span>
            </div>
            <div className="telemetry-item">
              <span className="label">İrtifa:</span>
              <span className="value">{telemetryData.iha_irtifa} m</span>
            </div>
            <div className="telemetry-item">
              <span className="label">Orientasyon:</span>
              <span className="value">
                Yatış: {telemetryData.iha_yatis}° | Dikilme:{" "}
                {telemetryData.iha_dikilme}° | Yön: {telemetryData.iha_yonelme}°
              </span>
            </div>
            <div className="telemetry-item">
              <span className="label">Hız:</span>
              <span className="value">{telemetryData.iha_hiz} m/s</span>
            </div>
            <div className="telemetry-item">
              <span className="label">Batarya:</span>
              <span className="value battery">
                <span
                  className="battery-level"
                  style={{ width: `${telemetryData.iha_batarya}%` }}
                />
                {telemetryData.iha_batarya}%
              </span>
            </div>
            <div className="telemetry-item">
              <span className="label">GPS Saati:</span>
              <span className="value">
                {`${telemetryData.gps_saati?.saat || "00"}:${
                  telemetryData.gps_saati?.dakika || "00"
                }:${telemetryData.gps_saati?.saniye || "00"}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Telemetry;
