import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MilestoneForm.css';

function MilestoneForm({ user, onMilestoneCreated, isVisible = true }) {
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
        'http://localhost:5000/api/milestones',
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
      
      // Kilometre taşı listesini yenile
      if (onMilestoneCreated) onMilestoneCreated();
      
      setLoading(false);
    } catch (err) {
      console.error('Kilometre taşı oluşturulurken hata:', err);
      setError('Kilometre taşı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  // Sadece takım liderleri kilometre taşı oluşturabilir, admin değil
  if (user?.role !== 'team_leader' || !isVisible) {
    return null;
  }

  return (
    <div className="milestone-form-container">
      <h3>Yeni Kilometre Taşı Oluştur</h3>
      <form onSubmit={handleSubmit} className="milestone-form">
        <div className="form-group">
          <label>Kilometre Taşı Başlığı</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Kilometre taşının başlığını girin"
          />
        </div>
        
        <div className="form-group">
          <label>Kilometre Taşı Açıklaması</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kilometre taşının detaylarını girin"
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
          {loading ? 'Oluşturuluyor...' : 'Kilometre Taşı Oluştur'}
        </button>
      </form>
    </div>
  );
}

export default MilestoneForm;