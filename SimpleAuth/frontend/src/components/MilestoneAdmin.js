import React, { useState, useEffect } from "react";
import { 
  getMilestones, 
  getMilestonesByTeamId, 
  assignMilestoneToTeamLeader, 
  updateMilestone, 
  deleteMilestone, 
  verifyMilestone, 
  rejectMilestone,
  getAllTeams,
  getUsersByTeam
} from "../api/api";
import "./MilestoneAdmin.css";

function MilestoneAdmin({ user }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [viewMode, setViewMode] = useState("all"); // "all", "pending", "team"
  const [showAssignForm, setShowAssignForm] = useState(false);

  // Form states for assigning milestone
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: ""
  });

  // Fetch all milestones
  useEffect(() => {
    const fetchMilestones = async () => {
      setLoading(true);
      try {
        let response;

        if (viewMode === "all") {
          response = await getMilestones();
        } else if (viewMode === "team" && selectedTeam) {
          response = await getMilestonesByTeamId(selectedTeam);
        } else {
          // Default to all milestones if no valid selection
          response = await getMilestones();
        }

        if (!response || !response.data) {
          throw new Error("Failed to fetch milestones");
        }

        // For "pending" view, filter for submitted milestones only
        let milestoneData = response.data;
        if (viewMode === "pending") {
          milestoneData = milestoneData.filter(m => m.status === "submitted");
        }

        setMilestones(milestoneData);
        setError(null);
      } catch (err) {
        console.error("Error fetching milestones:", err);
        setError("Kilometre taşları yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [viewMode, selectedTeam]);

  // Fetch teams data for dropdown
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await getAllTeams();
        if (!response || !response.data) {
          throw new Error("Failed to fetch teams");
        }
        setTeams(response.data);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Takımlar yüklenemedi.");
      }
    };

    fetchTeams();
  }, []);

  // Fetch team leaders when a team is selected in the form
  useEffect(() => {
    const fetchTeamLeaders = async () => {
      if (!formData.team) return;
      
      try {
        const response = await getUsersByTeam(formData.team);
        if (!response || !response.data) {
          throw new Error("Failed to fetch team members");
        }
        
        // Filter to only show team leaders
        const leaders = response.data.filter(user => user.role === "team_leader");
        setTeamLeaders(leaders);
        
        // Reset the assignedTo if the current value isn't a leader in this team
        if (formData.assignedTo && !leaders.find(l => l._id === formData.assignedTo)) {
          setFormData(prev => ({ ...prev, assignedTo: "" }));
        }
      } catch (err) {
        console.error("Error fetching team leaders:", err);
      }
    };

    if (showAssignForm) {
      fetchTeamLeaders();
    }
  }, [formData.team, showAssignForm]);

  // Handler for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If changing team, also update the team field
    if (name === "team") {
      setFormData(prev => ({
        ...prev,
        team: value,
        assignedTo: "" // Reset the assignedTo when team changes
      }));
    }
  };

  // Handler for assigning milestone to a team leader
  const handleAssignMilestone = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.assignedTo) {
      setError("Lütfen başlık ve takım lideri seçin.");
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await assignMilestoneToTeamLeader({
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo
      });
      
      if (!response || !response.data) {
        throw new Error("Milestone atama başarısız");
      }
      
      // Reset form and reload milestones
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        team: ""
      });
      setShowAssignForm(false);
      
      // Refresh milestones
      const milestonesResponse = await getMilestones();
      if (milestonesResponse && milestonesResponse.data) {
        setMilestones(milestonesResponse.data);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error assigning milestone:", err);
      setError("Milestone atanamadı. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for verifying a milestone
  const handleVerifyMilestone = async (milestoneId) => {
    try {
      await verifyMilestone(milestoneId);
      
      // Update local state to reflect the change
      setMilestones(prevMilestones => 
        prevMilestones.map(milestone => 
          milestone._id === milestoneId 
            ? { ...milestone, status: "verified" } 
            : milestone
        )
      );
    } catch (err) {
      console.error("Error verifying milestone:", err);
      setError("Milestone doğrulanamadı. Lütfen daha sonra tekrar deneyin.");
    }
  };

  // Handler for rejecting a milestone
  const handleRejectMilestone = async (milestoneId) => {
    try {
      await rejectMilestone(milestoneId);
      
      // Update local state to reflect the change
      setMilestones(prevMilestones => 
        prevMilestones.map(milestone => 
          milestone._id === milestoneId 
            ? { ...milestone, status: "rejected" } 
            : milestone
        )
      );
    } catch (err) {
      console.error("Error rejecting milestone:", err);
      setError("Milestone reddedilemedi. Lütfen daha sonra tekrar deneyin.");
    }
  };

  // Handler for deleting a milestone
  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm("Bu kilometre taşını silmek istediğinize emin misiniz?")) {
      return;
    }
    
    try {
      await deleteMilestone(milestoneId);
      
      // Remove the deleted milestone from state
      setMilestones(prevMilestones => 
        prevMilestones.filter(milestone => milestone._id !== milestoneId)
      );
    } catch (err) {
      console.error("Error deleting milestone:", err);
      setError("Milestone silinemedi. Lütfen daha sonra tekrar deneyin.");
    }
  };

  // Helper function to get status text in Turkish
  const getStatusText = (status) => {
    switch (status) {
      case "todo": return "Beklemede";
      case "in-progress": return "Devam Ediyor";
      case "on-hold": return "Bekletiliyor";
      case "submitted": return "Onay Bekliyor";
      case "verified": return "Onaylandı";
      case "rejected": return "Reddedildi";
      default: return status;
    }
  };

  // Helper function to get CSS class for status
  const getStatusClass = (status) => {
    switch (status) {
      case "todo": return "status-pending";
      case "in-progress": return "status-progress";
      case "on-hold": return "status-onhold";
      case "submitted": return "status-submitted";
      case "verified": return "status-verified";
      case "rejected": return "status-rejected";
      default: return "";
    }
  };

  return (
    <div className="milestone-admin-container">
      <div className="milestone-admin-header">
        <h3>🎯 Kilometre Taşları Yönetimi</h3>
        <div className="milestone-admin-filters">
          <button 
            className={`filter-btn ${viewMode === "all" ? "active" : ""}`}
            onClick={() => setViewMode("all")}
          >
            Tümü
          </button>
          <button 
            className={`filter-btn ${viewMode === "pending" ? "active" : ""}`}
            onClick={() => setViewMode("pending")}
          >
            Onay Bekleyenler
          </button>
          <button 
            className={`filter-btn ${viewMode === "team" ? "active" : ""}`}
            onClick={() => setViewMode("team")}
          >
            Takıma Göre
          </button>
          
          {viewMode === "team" && (
            <select 
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="team-select"
            >
              <option value="">Takım Seçin</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
          )}
        </div>
        <button 
          className="assign-btn"
          onClick={() => setShowAssignForm(!showAssignForm)}
        >
          {showAssignForm ? "Formu Kapat" : "Yeni Kilometre Taşı Ata"}
        </button>
      </div>

      {error && <div className="milestone-admin-error">{error}</div>}

      {/* Milestone assignment form */}
      {showAssignForm && (
        <div className="milestone-assignment-form">
          <h4>Takım Liderine Kilometre Taşı Ata</h4>
          <form onSubmit={handleAssignMilestone}>
            <div className="form-group">
              <label>Takım Seçin:</label>
              <select 
                name="team"
                value={formData.team}
                onChange={handleInputChange}
                required
              >
                <option value="">Takım Seçin</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Takım Lideri:</label>
              <select 
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                required
                disabled={!formData.team}
              >
                <option value="">Takım Lideri Seçin</option>
                {teamLeaders.map(leader => (
                  <option key={leader._id} value={leader._id}>
                    {leader.name} {leader.surname}
                  </option>
                ))}
              </select>
              {formData.team && teamLeaders.length === 0 && (
                <p className="form-hint">Bu takımda takım lideri bulunmuyor.</p>
              )}
            </div>

            <div className="form-group">
              <label>Başlık:</label>
              <input 
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Kilometre taşı başlığı"
                required
              />
            </div>

            <div className="form-group">
              <label>Açıklama:</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Kilometre taşı açıklaması"
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowAssignForm(false)}
              >
                İptal
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Atanıyor..." : "Kilometre Taşı Ata"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Milestones list */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Kilometre taşları yükleniyor...</p>
        </div>
      ) : milestones.length === 0 ? (
        <div className="no-milestones">
          <p>Bu kriterlere uygun kilometre taşı bulunamadı.</p>
        </div>
      ) : (
        <div className="milestones-list">
          {milestones.map(milestone => (
            <div key={milestone._id} className="milestone-card">
              <div className="milestone-header">
                <h4>{milestone.title}</h4>
                <span className={`milestone-status ${getStatusClass(milestone.status)}`}>
                  {getStatusText(milestone.status)}
                </span>
              </div>
              
              <p className="milestone-description">{milestone.description}</p>
              
              <div className="milestone-details">
                <p><strong>Takım:</strong> {milestone.team?.name || "-"}</p>
                <p>
                  <strong>Atanan:</strong> 
                  {milestone.assignedTo?.name 
                    ? `${milestone.assignedTo.name} ${milestone.assignedTo.surname || ""} (${milestone.assignedTo.role === "team_leader" ? "Takım Lideri" : "Personel"})` 
                    : "Atanmamış"}
                </p>
                {milestone.createdAt && (
                  <p><strong>Oluşturulma:</strong> {new Date(milestone.createdAt).toLocaleDateString()}</p>
                )}
              </div>
              
              <div className="milestone-actions">
                {milestone.status === "submitted" && (
                  <>
                    <button 
                      onClick={() => handleVerifyMilestone(milestone._id)}
                      className="verify-btn"
                    >
                      Onayla
                    </button>
                    <button 
                      onClick={() => handleRejectMilestone(milestone._id)}
                      className="reject-btn"
                    >
                      Reddet
                    </button>
                  </>
                )}
                <button 
                  onClick={() => handleDeleteMilestone(milestone._id)}
                  className="delete-btn"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MilestoneAdmin;