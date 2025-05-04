import { useState, useEffect } from "react";
import { uploadFile, getReceivedFiles, getSentFiles, getFileRecipients, deleteFile, downloadFile } from "../api/api";
import axios from "axios";
import "./FileShare.css";

// File type icon mapping for common file types
const getFileIcon = (fileName) => {
  if (!fileName) return "📄"; // Default document icon
  
  const extension = fileName.split('.').pop().toLowerCase();
  
  const iconMap = {
    // Images
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    
    // Documents
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'txt': '📝',
    
    // Spreadsheets
    'xls': '📊',
    'xlsx': '📊',
    'csv': '📊',
    
    // Presentations
    'ppt': '📊',
    'pptx': '📊',
    
    // Archives
    'zip': '📦',
    'rar': '📦',
    'tar': '📦',
    'gz': '📦',
    
    // Other
    'mp3': '🎵',
    'mp4': '🎬',
    'avi': '🎬',
  };
  
  return iconMap[extension] || "📄"; // Return mapped icon or default
};

function FileShare({ user }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("received"); // "received" or "sent"
  const [recipient, setRecipient] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchFiles();
  }, [activeTab]);

  // Fetch recipients for the dropdown
  useEffect(() => {
    if (user.role === "admin" || user.role === "team_leader") {
      const fetchRecipients = async () => {
        try {
          const response = await getFileRecipients();
          setRecipients(response.data);
        } catch (err) {
          console.error("Alıcılar yüklenemedi:", err);
          setError("Alıcı listesi yüklenemedi. Lütfen daha sonra tekrar deneyin.");
        }
      };
      fetchRecipients();
    }
  }, [user]);

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
    setUploadProgress(0);
  };

  // Dosya yükleme
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError("Lütfen bir dosya seçin!");
      return;
    }
    
    if (!recipient) {
      setError("Lütfen bir alıcı seçin!");
      return;
    }
    
    // Dosya boyutu kontrolü (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu çok büyük! Maksimum 5MB yükleyebilirsiniz.");
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
      setError("Dosya türü desteklenmiyor! Sadece PDF, DOC, DOCX, JPG, JPEG, PNG, XLS, XLSX, TXT dosyaları yükleyebilirsiniz.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("recipient", recipient);
    
    // Declare progressInterval outside the try-catch so it's available in both blocks
    let progressInterval;
    
    try {
      setLoading(true);
      setUploadProgress(10); // Start progress
      
      // Simulating progress during upload (since axios doesn't always report it correctly)
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);
      
      await uploadFile(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setMessage("Dosya başarıyla gönderildi!");
        setSelectedFile(null);
        setRecipient("");
        setUploadProgress(0);
        document.getElementById("file-input").value = "";
        document.getElementById("recipient").value = "";
        
        // After upload, switch to sent tab to show the uploaded file
        setActiveTab("sent");
        fetchFiles();
      }, 500);
      
    } catch (err) {
      console.error("Dosya gönderme hatası:", err);
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(0);
      setError("Dosya gönderilemedi. " + (err.response?.data?.message || "Lütfen daha sonra tekrar deneyin."));
    } finally {
      setLoading(false);
    }
  };

  // Dosyayı indir
  const handleDownload = async (file) => {
    try {
      setLoading(true);
      setError("");
      
      // Make a direct XMLHttpRequest for better binary data handling
      const xhr = new XMLHttpRequest();
      const token = localStorage.getItem("token");
      
      // Create a Promise to handle the XHR response
      const downloadPromise = new Promise((resolve, reject) => {
        xhr.open('GET', `http://localhost:5000/api/files/download/${file._id}`, true);
        xhr.responseType = 'arraybuffer'; // Using arraybuffer for binary data
        
        // Set Authorization header
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.onload = function() {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error(`Server returned ${this.status}: ${this.statusText}`));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Network error occurred'));
        };
        
        xhr.send();
      });
      
      // Wait for the download to complete
      const arrayBuffer = await downloadPromise;
      
      // Create a blob with the correct type
      const mimetype = file.mimetype || getMimeTypeFromExtension(file.originalName || file.originalname);
      const blob = new Blob([arrayBuffer], { type: mimetype });
      
      // Create a download link for the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Set the file name
      const fileName = file.originalName || file.originalname || "downloaded-file";
      link.setAttribute("download", fileName);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url); // Important: release the object URL to free memory
      setLoading(false);
    } catch (err) {
      console.error("Dosya indirme hatası:", err);
      setError("Dosya indirilemedi. Lütfen daha sonra tekrar deneyin.");
      setLoading(false);
    }
  };
  
  // Helper function to get MIME type from file extension
  const getMimeTypeFromExtension = (filename) => {
    if (!filename) return 'application/octet-stream';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'csv': 'text/csv'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  };

  // Dosyayı sil (sadece admin veya yükleyen kişi)
  const handleDelete = async (fileId) => {
    if (!window.confirm("Bu dosyayı silmek istediğinize emin misiniz?")) return;
    
    try {
      setLoading(true);
      await deleteFile(fileId);
      setMessage("Dosya başarıyla silindi!");
      fetchFiles();
    } catch (err) {
      console.error("Dosya silme hatası:", err);
      setError("Dosya silinemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "Boyut bilinmiyor";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return "Tarih bilgisi yok";
    return new Date(dateString).toLocaleString("tr-TR");
  };

  return (
    <div className="file-share-container">
      <h3>📁 Dosya Paylaşımı</h3>
      
      {/* Yükleme Formu - Only visible to admins and team leaders */}
      {(user.role === "admin" || user.role === "team_leader") && (
        <div className="file-upload-section">
          <h4>Yeni Dosya Gönder</h4>
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
            
            <div className="recipient-selection">
              <select 
                name="recipient" 
                id="recipient"
                onChange={(e) => setRecipient(e.target.value)}
                required
              >
                <option value="">Alıcı Seçin</option>
                {recipients.map(recipient => (
                  <option key={recipient._id} value={recipient._id}>
                    {recipient.name} {recipient.surname} ({recipient.role === "admin" ? "Yönetici" : recipient.role === "team_leader" ? "Takım Lideri" : "Personel"})
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              type="submit" 
              className="upload-button"
              disabled={loading || !selectedFile || !recipient}
            >
              {loading ? "Gönderiliyor..." : "Gönder"}
            </button>
          </form>
          
          {uploadProgress > 0 && (
            <div className="upload-progress-container">
              <div 
                className="upload-progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className="upload-progress-text">{uploadProgress}%</span>
            </div>
          )}
          
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
      
      {/* Regular users see this message */}
      {user.role === "personel" && (
        <div className="file-info-message">
          <p>Dosya gönderme yetkisi yalnızca Yöneticiler ve Takım Liderlerine aittir.</p>
        </div>
      )}
      
      {/* Dosya Listesi */}
      <div className="files-list-section">
        <div className="files-tabs">
          <button 
            className={`tab-button ${activeTab === "received" ? "active" : ""}`}
            onClick={() => setActiveTab("received")}
            style={{
              backgroundColor: activeTab === "received" ? "#4f70ec" : "#ffffff",
              color: activeTab === "received" ? "#ffffff" : "#555"
            }}
          >
            Alınan Dosyalar
          </button>
          
          {/* Only show Sent Files tab for admins and team leaders */}
          {(user.role === "admin" || user.role === "team_leader") && (
            <button 
              className={`tab-button ${activeTab === "sent" ? "active" : ""}`}
              onClick={() => setActiveTab("sent")}
              style={{
                backgroundColor: activeTab === "sent" ? "#4f70ec" : "#ffffff",
                color: activeTab === "sent" ? "#ffffff" : "#555"
              }}
            >
              Gönderilen Dosyalar
            </button>
          )}
        </div>
        
        <h4>{activeTab === "received" ? "Alınan Dosyalar" : "Gönderilen Dosyalar"}</h4>
        
        {loading && <p className="loading-message">Dosyalar getiriliyor...</p>}
        
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
                <th>Dosya</th>
                <th>Boyut</th>
                <th>{activeTab === "received" ? "Gönderen" : "Alıcı"}</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id}>
                  <td className="file-name-cell">
                    <span className="file-icon">{getFileIcon(file.originalName || file.originalname)}</span>
                    <span className="file-name">{file.originalName || file.originalname || "Dosya adı bilinmiyor"}</span>
                  </td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>
                    {activeTab === "received"
                      ? (file.sender?.name 
                          ? `${file.sender.name} ${file.sender.surname}` 
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
                    
                    {/* Only show delete button for admin users */}
                    {user.role === "admin" && (
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
