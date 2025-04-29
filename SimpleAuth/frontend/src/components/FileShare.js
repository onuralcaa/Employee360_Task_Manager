import { useState, useEffect } from "react";
import { uploadFile, getReceivedFiles, getSentFiles, downloadFile, deleteFile } from "../api/api";
import "./FileShare.css";

function FileShare({ user }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("received"); // "received" or "sent"

  useEffect(() => {
    fetchFiles();
  }, [activeTab]);

  // Dosyaları getir
  const fetchFiles = async () => {
    try {
      setLoading(true);
      let res;
      
      if (activeTab === "received") {
        res = await getReceivedFiles();
      } else {
        res = await getSentFiles();
      }
      
      setFiles(res.data);
      setError("");
    } catch (err) {
      console.error("Dosyalar yüklenemedi:", err);
      setError("Dosyalar yüklenemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Dosya seçme
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
    setError("");
  };

  // Dosya yükleme
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError("Lütfen bir dosya seçin!");
      return;
    }
    
    // Dosya boyutu kontrolü (20MB)
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("Dosya boyutu çok büyük! Maksimum 20MB yükleyebilirsiniz.");
      return;
    }
    
    // Dosya türü kontrolü
    const allowedTypes = [
      "image/jpeg", 
      "image/png", 
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain"
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Dosya türü desteklenmiyor! Sadece resim, PDF, Word, Excel ve text dosyalarını yükleyebilirsiniz.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("uploadedBy", user.id || user._id);
    
    try {
      setLoading(true);
      await uploadFile(formData);
      setMessage("Dosya başarıyla yüklendi!");
      setSelectedFile(null);
      document.getElementById("file-input").value = "";
      // After upload, switch to sent tab to show the uploaded file
      setActiveTab("sent");
      fetchFiles();
    } catch (err) {
      console.error("Dosya yükleme hatası:", err);
      setError("Dosya yüklenemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Dosyayı indir
  const handleDownload = async (file) => {
    try {
      const response = await downloadFile(file._id);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalname);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Dosya indirme hatası:", err);
      setError("Dosya indirilemedi. Lütfen daha sonra tekrar deneyin.");
    }
  };

  // Dosyayı sil (sadece admin veya yükleyen kişi)
  const handleDelete = async (fileId) => {
    if (!window.confirm("Bu dosyayı silmek istediğinize emin misiniz?")) return;
    
    try {
      await deleteFile(fileId);
      setMessage("Dosya başarıyla silindi!");
      fetchFiles();
    } catch (err) {
      console.error("Dosya silme hatası:", err);
      setError("Dosya silinemedi. Lütfen daha sonra tekrar deneyin.");
    }
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  return (
    <div className="file-share-container">
      <h3>📁 Dosya Paylaşımı</h3>
      
      {/* Yükleme Formu */}
      <div className="file-upload-section">
        <h4>Yeni Dosya Yükle</h4>
        <form onSubmit={handleUpload} className="file-upload-form">
          <div className="file-input-container">
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="file-input" className="file-input-label">
              {selectedFile ? selectedFile.name : "Dosya Seç"}
            </label>
          </div>
          
          <button 
            type="submit" 
            className="upload-button"
            disabled={loading}
          >
            {loading ? "Yükleniyor..." : "Yükle"}
          </button>
        </form>
        
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {/* Dosya Listesi */}
      <div className="files-list-section">
        <div className="files-tabs">
          <button 
            className={`tab-button ${activeTab === "received" ? "active" : ""}`}
            onClick={() => setActiveTab("received")}
          >
            Alınan Dosyalar
          </button>
          <button 
            className={`tab-button ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            Gönderilen Dosyalar
          </button>
        </div>
        
        <h4>{activeTab === "received" ? "Alınan Dosyalar" : "Gönderilen Dosyalar"}</h4>
        
        {loading && <p className="loading-message">Dosyalar yükleniyor...</p>}
        
        {!loading && files.length === 0 && (
          <p className="no-files">
            {activeTab === "received" 
              ? "Henüz dosya alınmamış." 
              : "Henüz dosya gönderilmemiş."}
          </p>
        )}
        
        {!loading && files.length > 0 && (
          <table className="files-table">
            <thead>
              <tr>
                <th>Dosya Adı</th>
                <th>Boyut</th>
                <th>{activeTab === "received" ? "Gönderen" : "Alıcı"}</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id}>
                  <td>{file.originalname}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>
                    {activeTab === "received"
                      ? (file.uploadedBy?.name 
                          ? `${file.uploadedBy.name} ${file.uploadedBy.surname}` 
                          : "Bilinmiyor")
                      : (file.recipient?.name
                          ? `${file.recipient.name} ${file.recipient.surname}`
                          : "Bilinmiyor")
                    }
                  </td>
                  <td>{formatDate(file.createdAt)}</td>
                  <td className="file-actions">
                    <button 
                      onClick={() => handleDownload(file)} 
                      className="download-button"
                    >
                      İndir
                    </button>
                    
                    {(user.role === "admin" || user.id === file.uploadedBy?._id || user._id === file.uploadedBy?._id) && (
                      <button 
                        onClick={() => handleDelete(file._id)} 
                        className="delete-button"
                      >
                        Sil
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default FileShare;
