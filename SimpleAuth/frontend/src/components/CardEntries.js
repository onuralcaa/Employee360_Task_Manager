import { useEffect, useState } from "react";
import { getAllEntries } from "../api/api";
import "./CardEntries.css";

function CardEntries() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      getAllEntries()
        .then((res) => setEntries(res.data))
        .catch((err) => console.error("Giriş kayıtları alınamadı:", err));
    };

    fetchData(); // İlk yükleme
    const interval = setInterval(fetchData, 5000); // 5 saniyede bir güncelle

    return () => clearInterval(interval); // Sayfa kapatıldığında temizle
  }, []);

  return (
    <div className="card-entries-container">
      <h3>📋 Kart Giriş Kayıtları</h3>
      {entries.map((entry) => (
        <div className="entry-card" key={entry._id}>
          <p><strong>👤 Personel:</strong> {entry.name}</p>
          <p><strong>💳 UID:</strong> {entry.uid}</p>
          <p><strong>⏰ Tarih:</strong> {new Date(entry.time).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default CardEntries;
