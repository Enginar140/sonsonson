import "../styles/global.css";
import "../styles/components/yonetim.css";

export default function Yonetim() {
  return (
    <div className="dashboard-container">
      {/* Üst Kısım */}
      <div className="status-screen">
        <h2>Durum Ekranı</h2>
        <div className="status-content">
          <p>Sistem durumu: Çalışıyor</p>
          <p>Son güncelleme: {new Date().toLocaleString()}</p>
        </div>
      </div>

      <div className="buttons-panel">
        <h2>İşlemler</h2>
        <div className="button-group">
          <button className="action-button start-button">Başlat</button>
          <button className="action-button stop-button">Durdur</button>
          <button className="action-button settings-button">Ayarlar</button>
          <button className="action-button report-button">Rapor Al</button>
        </div>
      </div>

      {/* Alt Kısım */}
      <div className="simulation-screen">
        <h2>Simülasyon Ekranı</h2>
        <div className="simulation-content">
          <p>Simülasyon hazır bekliyor...</p>
          <div className="simulation-visual"></div>
        </div>
      </div>

      <div className="log-panel">
        <h2>Sistem Logları</h2>
        <div className="log-content">
          <p>[INFO] Sistem başlatıldı - {new Date().toLocaleTimeString()}</p>
          <p>[DEBUG] Bağlantı kontrol ediliyor...</p>
          <p>[INFO] Veritabanı bağlantısı başarılı</p>
          <p>[WARNING] Yüksek bellek kullanımı tespit edildi</p>
          <p>[ERROR] Dış API'ye bağlanılamadı</p>
          <p>[INFO] Yeniden deneme başlatıldı</p>
          <p>[SUCCESS] İşlem tamamlandı</p>
          <p>[INFO] Kullanıcı girişi yapıldı</p>
          <p>[DEBUG] Veri işleniyor...</p>
          <p>[INFO] İşlem sırasına eklendi</p>
        </div>
      </div>
    </div>
  );
}
