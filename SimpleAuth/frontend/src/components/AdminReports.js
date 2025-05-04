import React, { useState, useEffect } from 'react';
import { 
  getAllReports, 
  getReportById, 
  deleteReport, 
  generateTextReport 
} from '../api/api';
import './Reports.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReportCharts from './ReportCharts';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'draft', 'submitted'
  
  // Load all reports for admin
  useEffect(() => {
    fetchReports();
  }, []);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getAllReports();
      setReports(response.data);
    } catch (error) {
      console.error('Rapor getirme hatası:', error);
      toast.error('Raporlar yüklenirken bir hata oluştu');
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
  
  // Report list with filtering
  const renderReportList = () => {
    const filteredReports = filter === 'all' 
      ? reports 
      : reports.filter(report => report.status === filter);
      
    if (filteredReports.length === 0) {
      return <p>Bu kriterlere uygun rapor bulunamadı.</p>;
    }
    
    return (
      <div className="report-list">
        {filteredReports.map(report => (
          <div key={report._id} className="report-card">
            <h3>{report.title}</h3>
            <p>
              <strong>Takım:</strong> {report.team?.name || 'Belirtilmemiş'}
            </p>
            <p>
              <strong>Takım Lideri:</strong> {report.teamLeader ? `${report.teamLeader.name} ${report.teamLeader.surname}` : 'Belirtilmemiş'}
            </p>
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
              <button 
                className="view-button"
                onClick={() => handleViewReport(report._id)}
              >
                Detaylar
              </button>
              
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
            <strong>Takım Lideri:</strong> {
              selectedReport.teamLeader ? 
              `${selectedReport.teamLeader.name} ${selectedReport.teamLeader.surname}` : 
              'Belirtilmemiş'
            }
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
        
        {/* Add charts visualization */}
        <ReportCharts content={selectedReport.content} />
        
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
          
          <button 
            className="delete-button"
            onClick={() => handleDeleteReport(selectedReport._id)}
          >
            Raporu Sil
          </button>
          
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
  
  // Filter controls
  const renderFilterControls = () => {
    return (
      <div className="filter-controls">
        <label>
          <input 
            type="radio" 
            name="filter" 
            value="all" 
            checked={filter === 'all'} 
            onChange={() => setFilter('all')} 
          />
          Tüm Raporlar
        </label>
        
        <label>
          <input 
            type="radio" 
            name="filter" 
            value="draft" 
            checked={filter === 'draft'} 
            onChange={() => setFilter('draft')} 
          />
          Taslak Raporlar
        </label>
        
        <label>
          <input 
            type="radio" 
            name="filter" 
            value="submitted" 
            checked={filter === 'submitted'} 
            onChange={() => setFilter('submitted')} 
          />
          Gönderilmiş Raporlar
        </label>
      </div>
    );
  };
  
  return (
    <div className="report-container">
      <h2>📊 Tüm Takım Raporları</h2>
      
      {!selectedReport && renderFilterControls()}
      
      {selectedReport ? renderReportDetail() : renderReportList()}
      
      <ToastContainer position="top-center" />
    </div>
  );
}

export default AdminReports;