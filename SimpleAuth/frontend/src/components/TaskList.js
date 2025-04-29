import React, { useState, useEffect } from "react";
import { getTasks, getTasksByUserId, updateTask, getMilestones, getMilestonesByUserId, updateMilestone } from "../api/api";
import "./TaskList.css";

function TaskList({ 
  user, 
  onSelectMilestone, 
  onAddMilestone, 
  isAdmin = false, 
  isTeamLeader = false, 
  isMilestoneView = false 
}) {
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        
        if (isMilestoneView) {
          // Fetch milestones
          if (isAdmin) {
            // Admin can see all milestones
            response = await getMilestones();
          } else {
            // Regular users and team leaders only see their assigned milestones
            const userId = user.id || user._id;
            response = await getMilestonesByUserId(userId);
          }
          
          if (!response || !response.data) {
            throw new Error("Failed to fetch milestones");
          }
          
          setMilestones(response.data);
          
        } else {
          // Fetch tasks
          if (isAdmin) {
            // Admin can see all tasks
            response = await getTasks();
          } else {
            // Regular users only see their assigned tasks
            const userId = user.id || user._id;
            response = await getTasksByUserId(userId);
          }
          
          if (!response || !response.data) {
            throw new Error("Failed to fetch tasks");
          }
          
          setTasks(response.data);
        }
        
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${isMilestoneView ? 'milestones' : 'tasks'}:`, err);
        setError(`Failed to load ${isMilestoneView ? 'milestones' : 'tasks'}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.id || user._id)) {
      fetchData();
    }
  }, [user, isAdmin, isMilestoneView, isTeamLeader]);

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      let response;
      
      if (isMilestoneView) {
        response = await updateMilestone(itemId, { status: newStatus });
        
        if (!response || !response.data) {
          throw new Error("Failed to update milestone status");
        }
        
        // Update the local state with the updated milestone
        setMilestones(milestones.map(milestone => 
          milestone._id === itemId 
            ? { ...milestone, status: newStatus } 
            : milestone
        ));
      } else {
        response = await updateTask(itemId, { status: newStatus });
        
        if (!response || !response.data) {
          throw new Error("Failed to update task status");
        }
        
        // Update the local state with the updated task
        setTasks(tasks.map(task => 
          task._id === itemId 
            ? { ...task, status: newStatus } 
            : task
        ));
      }
    } catch (err) {
      console.error(`Error updating ${isMilestoneView ? 'milestone' : 'task'} status:`, err);
      setError(`Failed to update ${isMilestoneView ? 'milestone' : 'task'} status. Please try again.`);
    }
  };
  
  const getFilteredItems = () => {
    const items = isMilestoneView ? milestones : tasks;
    if (filter === "all") return items;
    return items.filter(item => item.status === filter);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "todo": return "status-pending";
      case "in-progress": return "status-progress";
      case "on-hold": return "status-onhold";
      case "done": 
      case "submitted": return "status-completed";
      case "verified": return "status-verified";
      case "rejected": return "status-rejected";
      default: return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "todo": return "Beklemede";
      case "in-progress": return "Devam Ediyor";
      case "on-hold": return "Bekletiliyor";
      case "done": return "Tamamlandı";
      case "submitted": return "Gönderildi";
      case "verified": return "Onaylandı";
      case "rejected": return "Reddedildi";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{isMilestoneView ? "Kilometre Taşları" : "Görevler"} yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h3>{isMilestoneView ? "🎯 Kilometre Taşları" : "📋 Görevler"}</h3>
        {(isAdmin || isTeamLeader) && isMilestoneView && (
          <button className="add-milestone-btn" onClick={onAddMilestone}>
            + Yeni Kilometre Taşı Ekle
          </button>
        )}
        {(isAdmin || isTeamLeader) && !isMilestoneView && (
          <button className="add-milestone-btn" onClick={onAddMilestone}>
            + Yeni Görev Ekle
          </button>
        )}
      </div>

      <div className="filter-container">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Tümü
        </button>
        <button 
          className={`filter-btn ${filter === "todo" ? "active" : ""}`}
          onClick={() => setFilter("todo")}
        >
          Beklemede
        </button>
        <button 
          className={`filter-btn ${filter === "in-progress" ? "active" : ""}`}
          onClick={() => setFilter("in-progress")}
        >
          Devam Ediyor
        </button>
        {isMilestoneView ? (
          <button 
            className={`filter-btn ${filter === "submitted" ? "active" : ""}`}
            onClick={() => setFilter("submitted")}
          >
            Gönderildi
          </button>
        ) : (
          <button 
            className={`filter-btn ${filter === "done" ? "active" : ""}`}
            onClick={() => setFilter("done")}
          >
            Tamamlandı
          </button>
        )}
        <button 
          className={`filter-btn ${filter === "on-hold" ? "active" : ""}`}
          onClick={() => setFilter("on-hold")}
        >
          Bekletiliyor
        </button>
        <button 
          className={`filter-btn ${filter === "verified" ? "active" : ""}`}
          onClick={() => setFilter("verified")}
        >
          Onaylandı
        </button>
        <button 
          className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
          onClick={() => setFilter("rejected")}
        >
          Reddedildi
        </button>
      </div>

      {getFilteredItems().length === 0 ? (
        <p className="no-tasks">
          {isMilestoneView ? "Kilometre taşı bulunamadı." : "Görev bulunamadı."}
        </p>
      ) : (
        <div className="milestone-cards">
          {getFilteredItems().map((item) => (
            <div 
              key={item._id} 
              className={isMilestoneView ? "milestone-card" : "task-card"}
              onClick={() => onSelectMilestone && onSelectMilestone(item)}
            >
              <h4>{item.title}</h4>
              <p className="description">{item.description}</p>
              
              <div className={isMilestoneView ? "milestone-details" : "task-details"}>
                <div>
                  <p><strong>Takım:</strong> {item.team?.name || "-"}</p>
                  <p><strong>Atanan:</strong> {item.assignedTo?.name 
                    ? `${item.assignedTo.name} ${item.assignedTo.surname || ""}`
                    : "Atanmamış"}</p>
                </div>
                
                <div>
                  <p className={`status ${getStatusClass(item.status)}`}>
                    <strong>Durum:</strong> {getStatusText(item.status)}
                  </p>
                  {item.createdAt && (
                    <p><strong>Oluşturulma:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              {/* Task actions for regular users */}
              {!isMilestoneView && !isAdmin && (
                <div className="task-actions">
                  {item.status === "todo" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "in-progress");
                      }}
                      className="action-btn start-btn"
                    >
                      Başlat
                    </button>
                  )}
                  
                  {item.status === "in-progress" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "done");
                      }}
                      className="action-btn complete-btn"
                    >
                      Tamamla
                    </button>
                  )}
                  
                  {(item.status === "in-progress" || item.status === "todo") && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "on-hold");
                      }}
                      className="action-btn hold-btn"
                    >
                      Beklet
                    </button>
                  )}
                  
                  {item.status === "on-hold" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "in-progress");
                      }}
                      className="action-btn resume-btn"
                    >
                      Devam Et
                    </button>
                  )}
                </div>
              )}
              
              {/* Task actions for team leaders */}
              {!isMilestoneView && isTeamLeader && !isAdmin && (
                <div className="task-actions">
                  {item.status === "todo" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "in-progress");
                      }}
                      className="action-btn start-btn"
                    >
                      Başlat
                    </button>
                  )}
                  
                  {item.status === "in-progress" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "done");
                      }}
                      className="action-btn complete-btn"
                    >
                      Tamamla
                    </button>
                  )}
                  
                  {(item.status === "in-progress" || item.status === "todo") && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "on-hold");
                      }}
                      className="action-btn hold-btn"
                    >
                      Beklet
                    </button>
                  )}
                  
                  {item.status === "on-hold" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "in-progress");
                      }}
                      className="action-btn resume-btn"
                    >
                      Devam Et
                    </button>
                  )}
                </div>
              )}
              
              {/* Milestone actions for team leaders */}
              {isMilestoneView && isTeamLeader && (
                <div className="milestone-actions">
                  {item.status === "todo" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "in-progress");
                      }}
                      className="action-btn start-btn"
                    >
                      Başlat
                    </button>
                  )}
                  
                  {item.status === "in-progress" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "submitted");
                      }}
                      className="action-btn complete-btn"
                    >
                      Gönder
                    </button>
                  )}
                  
                  {(item.status === "in-progress" || item.status === "todo") && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "on-hold");
                      }}
                      className="action-btn hold-btn"
                    >
                      Beklet
                    </button>
                  )}
                  
                  {item.status === "on-hold" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item._id, "in-progress");
                      }}
                      className="action-btn resume-btn"
                    >
                      Devam Et
                    </button>
                  )}
                </div>
              )}
              
              {/* Admin milestone verification actions */}
              {(isAdmin && isMilestoneView && item.status === "submitted") && (
                <div className="milestone-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(item._id, "verified");
                    }}
                    className="action-btn verify-btn"
                  >
                    Onayla
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(item._id, "rejected");
                    }}
                    className="action-btn reject-btn"
                  >
                    Reddet
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;