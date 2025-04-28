import { useState, useEffect } from "react";
import api from "../api/api"; // Axios yerine api import edildi
import { FaDownload } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import "./FileShare.css";

function FileShare({ user }) {
  const [receiverId, setReceiverId] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchRecipients();
      fetchSentFiles();
      fetchReceivedFiles();
    }
  }, [user]);

  const fetchRecipients = async () => {
    try {
      const response = await api.get("/files/recipients");
      setRecipients(response.data);
    } catch (error) {
      console.error("Alıcılar alınırken hata oluştu:", error);
      setError("Alıcılar alınırken bir hata oluştu.");
    }
  };

  const fetchReceivedFiles = async () => {
    try {
      const response = await api.get("/files/received");
      setReceivedFiles(response.data);
    } catch (error) {
      console.error("Alınan dosyalar çekilirken hata:", error);
    }
  };

  const fetchSentFiles = async () => {
    try {
      const response = await api.get("/files/sent");
      setSentFiles(response.data);
    } catch (error) {
      console.error("Gönderilen dosyalar çekilirken hata:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleSendFile = async () => {
    if (!file) {
      setError("Lütfen bir dosya seçin!");
      return;
    }
    if (!receiverId) {
      setError("Lütfen bir alıcı seçin!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("recipient", receiverId);

    try {
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }, // Token zaten api.js'de otomatik ekleniyor!
      });
      alert("Dosya başarıyla gönderildi!");
      setFile(null);
      setReceiverId("");
      fetchSentFiles(); // Listeyi güncelle
    } catch (error) {
      console.error("Dosya gönderme hatası:", error);
      setError("Dosya gönderilirken bir hata oluştu.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-"; // Boşsa tire koy
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "-" : date.toLocaleString("tr-TR"); // Geçersizse tire koy
  };



  return (
    <div className="file-share-container">
      <h3>📂 Dosya Paylaşımı</h3>
      <div>
        <label>Alıcı (Takım Lideri):</label>
        <select onChange={(e) => setReceiverId(e.target.value)} value={receiverId}>
          <option value="">Alıcı Seç</option>
          {recipients.map((recipient) => (
            <option key={recipient._id} value={recipient._id}>
              {recipient.name} {recipient.surname} ({recipient.role})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Gönderilecek Dosya:</label>
        <input type="file" onChange={handleFileChange} required />
        <p>Desteklenen formatlar: PDF, DOC, DOCX, JPG, JPEG, PNG | Maksimum boyut: 5 MB</p>
      </div>

      <button onClick={handleSendFile}>Dosyayı Gönder</button>
      {error && <p className="error-message">{error}</p>}

      <div className="file-lists">
        <h4>📤 Gönderilen Dosyalar</h4>
        <table className="file-table">
          <thead>
            <tr>
              <th>Alıcı</th>
              <th>Rol</th>
              <th>Dosya Adı</th>
              <th>Tarih</th>
              <th>İndir</th>
            </tr>
          </thead>
          <tbody>
            {sentFiles.map((file) => (
              <tr key={file._id}>
                <td>{file.recipient?.name} {file.recipient?.surname}</td>
                <td>{file.recipient?.role}</td>
                <td>{file.originalName}</td>
                <td>{formatDate(file.uploadDate || file.createdAt)}</td>
                <td>
                  <a
                    href={`http://localhost:5000/uploads/${file.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-icon"
                  >
                    <FaEye />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4>📥 Alınan Dosyalar</h4>
        <table className="file-table">
          <thead>
            <tr>
              <th>Gönderen</th>
              <th>Rol</th>
              <th>Dosya Adı</th>
              <th>Tarih</th>
              <th>İndir</th>
            </tr>
          </thead>
          <tbody>
            {receivedFiles.map((file) => (
              <tr key={file._id}>
                <td>{file.sender?.name} {file.sender?.surname}</td>
                <td>{file.sender?.role}</td>
                <td>{file.originalName}</td>
                <td>{formatDate(file.uploadDate || file.createdAt)}</td>
                <td>
                  <a
                    href={`http://localhost:5000/uploads/${file.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-icon"
                  >
                    <FaDownload />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FileShare;
