import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Button, Alert } from '../../../components/common/UIComponents';
import { EmptyState } from '../../../components/common/EmptyState';
import { dashboardService } from '../dashboardService';
import { USER_ROLES } from '../../../shared/constants';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getTasks();
        setTasks(response.data);
      } catch (err) {
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError('Failed to log out');
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.firstName || 'User'}!</h1>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {error && (
        <Alert type="error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="dashboard-content">
        <Card title="Your Tasks" className="tasks-card">
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks found"
              description="You don't have any tasks assigned yet."
              actionText="Refresh"
              onAction={() => window.location.reload()}
            />
          ) : (
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className={`task-item ${task.status}`}>
                  <span className="task-title">{task.title}</span>
                  <span className="task-status">{task.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {user?.role === USER_ROLES.ADMIN && (
          <Card title="Management Controls" className="management-card">
            <div className="management-actions">
              <Button variant="primary">Create Task</Button>
              <Button variant="secondary">View Reports</Button>
              <Button variant="outline">Manage Team</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Dashboard;