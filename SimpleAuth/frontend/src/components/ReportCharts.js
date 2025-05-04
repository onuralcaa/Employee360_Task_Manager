import React from 'react';

function ReportCharts({ content }) {
  // Since charts are causing stability issues, we're providing a simplified version
  // that shows a summary instead of actual charts
  
  // Function to extract task data from HTML content (now simplified)
  const extractTaskData = () => {
    // If no content, return empty data
    if (!content) {
      return {
        statusCounts: {
          todo: 0,
          inProgress: 0,
          onHold: 0,
          done: 0,
          verified: 0,
          rejected: 0
        },
        memberData: []
      };
    }
    
    // Try to extract some basic information using regex patterns
    // This is more robust than DOM parsing
    try {
      // Extract status counts using regex
      const statusCounts = {
        todo: (content.match(/Bekleyen Görevler:<\/strong> (\d+)/i) || [0, 0])[1],
        inProgress: (content.match(/Devam Eden Görevler:<\/strong> (\d+)/i) || [0, 0])[1],
        onHold: (content.match(/Beklemede Olan Görevler:<\/strong> (\d+)/i) || [0, 0])[1],
        done: (content.match(/Tamamlanan Görevler:<\/strong> (\d+)/i) || [0, 0])[1],
        verified: (content.match(/Onaylanan Görevler:<\/strong> (\d+)/i) || [0, 0])[1],
        rejected: (content.match(/Reddedilen Görevler:<\/strong> (\d+)/i) || [0, 0])[1]
      };
      
      return { statusCounts };
    } catch (error) {
      console.error('Error parsing report content for summary:', error);
      return {
        statusCounts: {
          todo: 0,
          inProgress: 0,
          onHold: 0,
          done: 0,
          verified: 0,
          rejected: 0
        }
      };
    }
  };
  
  const { statusCounts } = extractTaskData();
  
  return (
    <div className="report-summary">
      <h3>Durum Özeti</h3>
      <div className="status-summary">
        <div className="status-item">
          <div className="status-color" style={{ backgroundColor: '#3498db' }}></div>
          <div className="status-label">Bekleyen Görevler: {statusCounts.todo}</div>
        </div>
        <div className="status-item">
          <div className="status-color" style={{ backgroundColor: '#f39c12' }}></div>
          <div className="status-label">Devam Eden Görevler: {statusCounts.inProgress}</div>
        </div>
        <div className="status-item">
          <div className="status-color" style={{ backgroundColor: '#95a5a6' }}></div>
          <div className="status-label">Beklemede Olan Görevler: {statusCounts.onHold}</div>
        </div>
        <div className="status-item">
          <div className="status-color" style={{ backgroundColor: '#2ecc71' }}></div>
          <div className="status-label">Tamamlanan Görevler: {statusCounts.done}</div>
        </div>
        <div className="status-item">
          <div className="status-color" style={{ backgroundColor: '#27ae60' }}></div>
          <div className="status-label">Onaylanan Görevler: {statusCounts.verified}</div>
        </div>
        <div className="status-item">
          <div className="status-color" style={{ backgroundColor: '#e74c3c' }}></div>
          <div className="status-label">Reddedilen Görevler: {statusCounts.rejected}</div>
        </div>
      </div>
    </div>
  );
}

export default ReportCharts;