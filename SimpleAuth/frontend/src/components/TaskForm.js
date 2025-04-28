import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskForm.css';

function TaskForm({ user, onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.team) {
      fetchTeamMembers();
    }
  }, [user]);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/users/by-team/${user.team}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Takım üyeleri alınırken hata oluştu:', error);
      setError('Takım üyeleri yüklenirken bir hata oluştu.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !assignedTo) {
      setError('Lütfen gerekli alanları doldurunuz.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/tasks',
        { 
          title,
          description,
          assignedTo,
          team: user.team
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Formu sıfırla
      setTitle('');
      setDescription('');
      setAssignedTo('');
      
      // Görev listesini yenile
      if (onTaskCreated) onTaskCreated();
      
      setLoading(false);
    } catch (err) {
      console.error('Görev oluşturulurken hata:', err);
      setError('Görev oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  // Takım lideri değilse form gösterilmesin
  if (user?.role !== 'team_leader') {
    return null;
  }

  return (
    <div className="task-form-container">
      <h3>Yeni Görev Oluştur</h3>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label>Görev Başlığı</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Görevin başlığını girin"
          />
        </div>
        
        <div className="form-group">
          <label>Görev Açıklaması</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Görevin detaylarını girin"
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label>Atanan Kişi</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          >
            <option value="">Bir takım üyesi seçin</option>
            {teamMembers.map(member => (
              <option key={member._id} value={member._id}>
                {member.name} {member.surname}
              </option>
            ))}
          </select>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Oluşturuluyor...' : 'Görev Oluştur'}
        </button>
      </form>
    </div>
  );
}

export default TaskForm;