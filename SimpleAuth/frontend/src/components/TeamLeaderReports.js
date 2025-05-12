import React, { useState, useEffect } from 'react';
import { 
  createReport, 
  getTeamLeaderReports, 
  getReportById, 
  submitReport, 
  deleteReport, 
  generateTextReport,
  generateReportFile 
} from '../api/api';
import './Reports.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TeamLeaderReports({ user }) {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [reportData, setReportData] = useState({
    title: '',
    introduction: '',
    periodStart: '',
    periodEnd: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Format date for input fields
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  };
  
  // Set default date range (last 30 days)
  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setReportData(prev => ({
      ...prev,
      periodEnd: formatDateForInput(endDate),
      periodStart: formatDateForInput(startDate)
    }));
  }, []);
  
  // Load team leader reports
  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user]);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getTeamLeaderReports();
      setReports(response.data);
    } catch (error) {
      console.error('Rapor getirme hatası:', error);
      toast.error('Raporlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateReport = async (e) => {
    e.preventDefault();
    
    if (!reportData.title.trim()) {
      toast.error('Lütfen rapor başlığı giriniz');
      return;
    }
    
    if (!reportData.introduction.trim()) {
      toast.error('Lütfen rapor açıklaması giriniz');
      return;
    }
    
    try {
      setLoading(true);
      const response = await createReport(reportData);
      
      toast.success('Rapor başarıyla oluşturuldu');
      setReports([response.data.report, ...reports]);
      setShowForm(false);
      setReportData({
        title: '',
        introduction: '',
        periodStart: reportData.periodStart,
        periodEnd: reportData.periodEnd
      });
    } catch (error) {
      console.error('Rapor oluşturma hatası:', error);
      toast.error(error.response?.data?.message || 'Rapor oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewReport = async (reportId) => {
    try {
      setLoading(true);
      const response = await getReportById(reportId);
      setSelectedReport(response.data);
    } catch (error) {
      console.error('Rapor detayı getirme hatası:', error);
      toast.error('Rapor detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitReport = async (reportId) => {
    try {
      setLoading(true);
      await submitReport(reportId);
      
      // Update local report status
      setReports(reports.map(report => 
        report._id === reportId ? { ...report, status: 'submitted' } : report
      ));
      
      if (selectedReport && selectedReport._id === reportId) {
        setSelectedReport({ ...selectedReport, status: 'submitted' });
      }
      
      toast.success('Rapor başarıyla gönderildi');
    } catch (error) {
      console.error('Rapor gönderme hatası:', error);
      toast.error('Rapor gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Bu raporu silmek istediğinize emin misiniz?')) {
      try {
        setLoading(true);
        await deleteReport(reportId);
        
        // Remove report from state
        setReports(reports.filter(report => report._id !== reportId));
        
        if (selectedReport && selectedReport._id === reportId) {
          setSelectedReport(null);
        }
        
        toast.success('Rapor başarıyla silindi');
      } catch (error) {
        console.error('Rapor silme hatası:', error);
        toast.error('Rapor silinirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleGenerateFile = async (reportId) => {
    try {
      setLoading(true);
      const response = await generateReportFile(reportId);
      
      // Create link to download file
      const downloadUrl = `http://localhost:5000${response.data.downloadUrl}`;
      window.open(downloadUrl, '_blank');
      
      toast.success('Rapor dosyası oluşturuldu');
    } catch (error) {
      console.error('Rapor dosyası oluşturma hatası:', error);
      toast.error('Rapor dosyası oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateTextReport = async (reportId) => {
    try {
      setLoading(true);
      const response = await generateTextReport(reportId);
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/plain;charset=utf-8' });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapor_${reportId}_${new Date().getTime()}.txt`);
      
      // Append the link to the body
      document.body.appendChild(link);
      
      // Programmatically click the link to trigger the download
      link.click();
      
      // Clean up by removing the link and revoking the URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Metin raporu başarıyla indirildi');
    } catch (error) {
      console.error('Metin raporu oluşturma hatası:', error);
      toast.error('Metin raporu oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Render report status badge
  const renderStatusBadge = (status) => {
    return (
      <span className={`report-status report-status-${status}`}>
        {status === 'draft' ? 'Taslak' : 'Gönderildi'}
      </span>
    );
  };
  
  // Create new report form
  const renderReportForm = () => {
    return (
      <div className="report-form-container">
        <h3>Yeni Rapor Oluştur</h3>
        <form className="report-form" onSubmit={handleCreateReport}>
          <div>
            <label>Rapor Başlığı</label>
            <input
              type="text"
              name="title"
              value={reportData.title}
              onChange={handleInputChange}
              placeholder="Rapor başlığını girin"
              required
            />
          </div>
          
          <div>
            <label>Rapor Açıklaması</label>
            <textarea
              name="introduction"
              value={reportData.introduction}
              onChange={handleInputChange}
              placeholder="Rapor için genel bir değerlendirme ya da açıklama yazın"
              required
            />
          </div>
          
          <div>
            <label>Rapor Dönemi</label>
            <div className="date-inputs">
              <input
                type="date"
                name="periodStart"
                value={reportData.periodStart}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="periodEnd"
                value={reportData.periodEnd}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="report-action-buttons">
            <button 
              type="submit" 
              className="report-create-button"
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : 'Rapor Oluştur'}
            </button>
            <button 
              type="button" 
              className="delete-button"
              onClick={() => setShowForm(false)}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  // Report list
  const renderReportList = () => {
    if (reports.length === 0) {
      return <p>Henüz rapor oluşturulmamış.</p>;
    }
    
    return (
      <div className="report-list">
        {reports.map(report => (
          <div key={report._id} className="report-card">
            <h3>{report.title}</h3>
            <p>
              <strong>Dönem:</strong> {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
            </p>
            <p>
              <strong>Durum:</strong> {renderStatusBadge(report.status)}
            </p>
            <p>
              <strong>Oluşturulma Tarihi:</strong> {formatDate(report.createdAt)}
            </p>
            
            <div className="report-action-buttons">
              {report.status === 'draft' && (
                <button 
                  className="submit-button"
                  onClick={() => handleSubmitReport(report._id)}
                >
                  Gönder
                </button>
              )}
              
              <button 
                className="download-button"
                onClick={() => handleGenerateTextReport(report._id)}
              >
                Raporu İndir
              </button>
              
              <button 
                className="delete-button"
                onClick={() => handleDeleteReport(report._id)}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Report detail
  const renderReportDetail = () => {
    if (!selectedReport) return null;
    
    return (
      <div className="report-detail">
        <h2>{selectedReport.title}</h2>
        
        <div className="report-detail-info">
          <p>
            <strong>Takım:</strong> {selectedReport.team?.name || 'Belirtilmemiş'}
          </p>
          <p>
            <strong>Dönem:</strong> {formatDate(selectedReport.periodStart)} - {formatDate(selectedReport.periodEnd)}
          </p>
          <p>
            <strong>Durum:</strong> {renderStatusBadge(selectedReport.status)}
          </p>
          <p>
            <strong>Oluşturulma Tarihi:</strong> {formatDate(selectedReport.createdAt)}
          </p>
        </div>
        
        <h3>Takım Lideri Yorumu</h3>
        <p>{selectedReport.introduction}</p>
        
        <h3>Rapor İçeriği</h3>
        <div
          className="report-content"
          dangerouslySetInnerHTML={{ __html: selectedReport.content }}
        />
        
        <div className="report-action-buttons">
          <button 
            className="view-button"
            onClick={() => handleGenerateTextReport(selectedReport._id)}
          >
            Raporu İndir
          </button>
          
          {selectedReport.status === 'draft' && (
            <button 
              className="submit-button"
              onClick={() => handleSubmitReport(selectedReport._id)}
            >
              Raporu Gönder
            </button>
          )}
          
          <button 
            className="delete-button"
            onClick={() => setSelectedReport(null)}
          >
            Kapat
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="report-container">
      <h2>📊 Takım Raporları</h2>
      
      {!showForm && !selectedReport && (
        <button 
          className="report-create-button"
          onClick={() => setShowForm(true)}
        >
          Yeni Rapor Oluştur
        </button>
      )}
      
      {showForm && renderReportForm()}
      
      {selectedReport ? renderReportDetail() : !showForm && renderReportList()}
      
      <ToastContainer position="top-center" />
    </div>
  );
}

export default TeamLeaderReports;