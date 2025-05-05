import { useEffect, useState } from "react";
import { getAllEntries } from "../api/api";
import "./CardEntries.css";

function CardEntries() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      getAllEntries()
        .then((res) => setEntries(res.data))
        .catch((err) => console.error("Giriş kayıtları alınamadı:", err));
    }, 3000); // 3 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="entry-container">
      <h3>📋 Kart Giriş Kayıtları</h3>
      {entries.map((entry) => (
        <div
          key={entry._id}
          className={`entry-card ${entry.type === "giris" ? "giris" : "cikis"}`}
        >
          <p>
            <span className="icon">👤</span>
            <strong>Personel:</strong> {entry.name}
          </p>
          <p>
            <span className="icon">💳</span>
            <strong>UID:</strong> {entry.uid}
          </p>
          <p>
            <span className="icon">⏰</span>
            <strong>Tarih:</strong>{" "}
            {new Date(entry.createdAt).toLocaleString()}
          </p>
          <p className={`type-label ${entry.type}`}>
            {entry.type === "giris" ? "🟢 GİRİŞ" : "🔴 ÇIKIŞ"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default CardEntries;
