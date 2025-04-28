import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaPause, FaPlay, FaTimes, FaHourglass } from 'react-icons/fa';
import './TaskList.css';

function TaskList({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Görevler alınırken hata oluştu:', err);
      setError('Görevler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks(); // Listeyi güncelle
    } catch (error) {
      console.error('Görev durumu güncellenirken hata:', error);
      alert('Görev durumu güncellenirken bir hata oluştu.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <span className="status-icon todo">Yapılacak</span>;
      case 'in-progress': return <span className="status-icon in-progress">Devam Ediyor</span>;
      case 'on-hold': return <span className="status-icon on-hold">Beklemede</span>;
      case 'done': return <span className="status-icon done">Tamamlandı</span>;
      case 'verified': return <span className="status-icon verified">Onaylandı</span>;
      case 'rejected': return <span className="status-icon rejected">Reddedildi</span>;
      default: return <span className="status-icon">Bilinmiyor</span>;
    }
  };

  const getStatusActions = (task) => {
    const actions = [];
    
    // İzin verilen durum geçişleri
    const allowedTransitions = {
      'todo': ['in-progress', 'on-hold'],
      'in-progress': ['done', 'on-hold'],
      'on-hold': ['in-progress', 'todo'],
      'done': ['verified', 'rejected'],
      'verified': [],
      'rejected': []
    };

    // Kullanıcının rolüne göre gösterilecek işlemler
    const userRole = user?.role;
    const transitions = allowedTransitions[task.status] || [];
    
    transitions.forEach(status => {
      // Doğrulama ve reddetme işlemleri sadece admin'e gösterilsin
      if ((status === 'verified' || status === 'rejected') && userRole !== 'admin') {
        return;
      }

      let icon;
      let label;
      
      switch (status) {
        case 'in-progress':
          icon = <FaPlay />;
          label = 'Başlat';
          break;
        case 'on-hold':
          icon = <FaPause />;
          label = 'Beklet';
          break;
        case 'done':
          icon = <FaCheck />;
          label = 'Tamamla';
          break;
        case 'todo':
          icon = <FaHourglass />;
          label = 'Yapılacak';
          break;
        case 'verified':
          icon = <FaCheck className="verified-icon" />;
          label = 'Onayla';
          break;
        case 'rejected':
          icon = <FaTimes className="rejected-icon" />;
          label = 'Reddet';
          break;
        default:
          return null;
      }
      
      actions.push(
        <button 
          key={status} 
          className={`action-button ${status}`}
          onClick={() => handleStatusChange(task._id, status)}
          title={label}
        >
          {icon} {label}
        </button>
      );
    });
    
    return actions.length ? <div className="task-actions">{actions}</div> : null;
  };

  const filterTasks = () => {
    if (activeTab === 'all') return tasks;
    if (activeTab === 'mine') return tasks.filter(task => task.assignedTo?._id === user?._id);
    if (activeTab === 'created') return tasks.filter(task => task.createdBy?._id === user?._id);
    return tasks;
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h3>Görev Listesi</h3>
        <div className="task-tabs">
          <button 
            className={activeTab === 'all' ? 'active' : ''} 
            onClick={() => setActiveTab('all')}
          >
            Tüm Görevler
          </button>
          <button 
            className={activeTab === 'mine' ? 'active' : ''} 
            onClick={() => setActiveTab('mine')}
          >
            Bana Atananlar
          </button>
          <button 
            className={activeTab === 'created' ? 'active' : ''} 
            onClick={() => setActiveTab('created')}
          >
            Oluşturduklarım
          </button>
        </div>
      </div>

      {loading ? (
        <div className="task-loading">Görevler yükleniyor...</div>
      ) : error ? (
        <div className="task-error">{error}</div>
      ) : (
        <div className="tasks">
          {filterTasks().length === 0 ? (
            <div className="no-tasks">Gösterilecek görev bulunamadı.</div>
          ) : (
            filterTasks().map(task => (
              <div key={task._id} className={`task-item status-${task.status}`}>
                <div className="task-header">
                  <h4>{task.title}</h4>
                  {getStatusIcon(task.status)}
                </div>
                <p className="task-description">{task.description}</p>
                <div className="task-info">
                  <p><strong>Atanan:</strong> {task.assignedTo?.name || 'Atanmamış'}</p>
                  <p><strong>Takım:</strong> {task.team?.name || '-'}</p>
                  <p><strong>Oluşturan:</strong> {task.createdBy?.name || '-'}</p>
                </div>
                {getStatusActions(task)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TaskList;