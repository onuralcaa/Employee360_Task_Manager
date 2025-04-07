import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from './common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', email: '', role: 'personel' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUsers(response.data.data);
      } catch (error) {
        setError('Failed to fetch users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    try {
      const response = await axios.post('/api/users/register', newUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers([...users, response.data]);
      setShowAddUserPopup(false);
      setNewUser({ name: '', username: '', email: '', role: 'personel' });
    } catch (error) {
      alert('Failed to add user. Please try again.');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-panel-container">
      <h1>Yönetim Paneli</h1>
      <input
        type="text"
        placeholder="Kullanıcıları Ara..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />
      <button className="add-user-button" onClick={() => setShowAddUserPopup(true)}>
        Kullanıcı Ekle
      </button>
      {showAddUserPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Yeni Kullanıcı Ekle</h2>
            <input
              type="text"
              placeholder="Ad"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Kullanıcı Adı"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="E-posta"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="personel">Personel</option>
              <option value="admin">Yönetici</option>
            </select>
            <button onClick={handleAddUser}>Gönder</button>
            <button onClick={() => setShowAddUserPopup(false)}>İptal</button>
          </div>
        </div>
      )}
      <table className="user-table">
        <thead>
          <tr>
            <th>Ad</th>
            <th>Kullanıcı Adı</th>
            <th>E-posta</th>
            <th>Rol</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button className="edit-button">Düzenle</button>
                <button className="delete-button">Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;