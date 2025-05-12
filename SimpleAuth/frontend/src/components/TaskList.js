import React, { useState, useEffect } from "react";
import { getTasks, getTasksByUserId, updateTask, getMilestones, getMilestonesByUserId, updateMilestone } from "../api/api";
import "./TaskList.css";

function TaskList({ 
  user, 
  onSelectMilestone, 
  onAddMilestone,
  showTaskForm,
  isAdmin = false, 
  isTeamLeader = false, 
  isMilestoneView = false 
}) {
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newAssignee, setNewAssignee] = useState("");

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

  useEffect(() => {
    // Load team members for task reassignment
    if (isTeamLeader && user?.team) {
      const fetchTeamMembers = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/users/by-team/${user.team}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          
          if (!response.ok) {
            throw new Error("Failed to fetch team members");
          }
          
          const data = await response.json();
          setTeamMembers(data);
        } catch (err) {
          console.error("Error fetching team members:", err);
        }
      };
      
      fetchTeamMembers();
    }
  }, [isTeamLeader, user]);

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      if (isMilestoneView) {
        const response = await updateMilestone(itemId, { status: newStatus });

        if (!response || !response.data) {
          throw new Error("Failed to update milestone status");
        }

        setMilestones(milestones.map(milestone => 
          milestone._id === itemId 
            ? { ...milestone, status: newStatus } 
            : milestone
        ));
      } else {
        const response = await updateTask(itemId, { status: newStatus });
        
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

  const handleReject = (taskId) => {
    setSelectedTaskId(taskId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async (action) => {
    try {
      if (action === "abort") {
        // Just mark as rejected
        await handleStatusChange(selectedTaskId, "rejected");
      } else if (action === "reassign" && newAssignee) {
        // First mark as rejected
        await updateTask(selectedTaskId, { status: "rejected" });
        
        // Then create a new task with the same details but new assignee
        const taskToReassign = tasks.find(task => task._id === selectedTaskId);
        if (taskToReassign) {
          const newTask = {
            title: taskToReassign.title,
            description: taskToReassign.description,
            assignedTo: newAssignee,
            team: taskToReassign.team._id || taskToReassign.team,
            status: "todo"
          };
          
          const response = await fetch("http://localhost:5000/api/tasks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(newTask),
          });
          
          if (!response.ok) {
            throw new Error("Failed to reassign task");
          }
          
          // Refresh task list
          const userId = user.id || user._id;
          const tasksResponse = await getTasksByUserId(userId);
          setTasks(tasksResponse.data);
        }
      }
    } catch (err) {
      console.error("Error handling rejection:", err);
      setError("Failed to process rejection. Please try again.");
    } finally {
      setShowRejectModal(false);
      setSelectedTaskId(null);
      setNewAssignee("");
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
      case "todo": return "Yapılacaklar";
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
        {isAdmin && isMilestoneView && (
          <button className="add-milestone-btn" onClick={onAddMilestone}>
            + Yeni Kilometre Taşı Ekle
          </button>
        )}
        {isTeamLeader && !isMilestoneView && (
          <button className="add-milestone-btn" onClick={onAddMilestone}>
            {showTaskForm ? "Formu Gizle" : "+ Yeni Görev Ekle"}
          </button>
        )}
        {isAdmin && !isMilestoneView && (
          <div className="admin-task-info">
            <p>Görev oluşturma yetkisi yalnızca Takım Liderlerine aittir.</p>
          </div>
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
          Yapılacaklar
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
              {!isMilestoneView && !isAdmin && !isTeamLeader && (
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
                  
                  {/* Removed the "Beklet" (on-hold) button from regular personnel view */}
                  
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
                  
                  {/* New buttons for team leaders to verify or reject completed tasks */}
                  {item.status === "done" && (
                    <>
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
                          handleReject(item._id);
                        }}
                        className="action-btn reject-btn"
                      >
                        Reddet
                      </button>
                    </>
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

      {/* Rejection modal for team leaders */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Görev Reddetme</h3>
            <p>Bu görevi reddetmek istediğinize emin misiniz?</p>
            
            <div className="modal-options">
              <div className="modal-option">
                <h4>Görevi Yeniden Atayın</h4>
                <p>Görevi başka bir takım üyesine yeniden atamak için:</p>
                <select 
                  value={newAssignee} 
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="reassign-select"
                >
                  <option value="">Kişi Seçin</option>
                  {teamMembers.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name} {member.surname}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => handleRejectConfirm("reassign")}
                  className="action-btn"
                  disabled={!newAssignee}
                >
                  Yeniden Ata
                </button>
              </div>
              
              <div className="modal-option">
                <h4>Görevi İptal Et</h4>
                <p>Görevi tamamen iptal edip reddedilmiş olarak işaretlemek için:</p>
                <button 
                  onClick={() => handleRejectConfirm("abort")}
                  className="action-btn reject-btn"
                >
                  İptal Et
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setShowRejectModal(false)}
              className="cancel-btn"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;