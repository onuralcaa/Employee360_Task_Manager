const Milestone = require("../models/milestoneModel");
const User = require("../models/userModel");

// Get all milestones (admin only)
async function getAllMilestones(req, res) {
  try {
    // Only admin can see all milestones
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Yetkiniz yok. Bu işlem sadece admin tarafından yapılabilir." });
    }

    const milestones = await Milestone.find()
      .populate("assignedTo", "name surname username role")
      .populate("team", "name")
      .sort({ createdAt: -1 });
      
    res.status(200).json(milestones);
  } catch (err) {
    console.error("Milestones alınırken hata:", err);
    res.status(500).json({ message: "Milestones alınırken hata oluştu.", error: err.message });
  }
}

// Get milestones for a specific user
async function getMilestonesByUserId(req, res) {
  try {
    const { userId } = req.params;
    
    // Admin can see any user's milestones, others can only see their own
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: "Başka kullanıcıların milestone'larını görüntüleme yetkiniz yok." });
    }
    
    const milestones = await Milestone.find({ assignedTo: userId })
      .populate("assignedTo", "name surname username role")
      .populate("team", "name")
      .sort({ createdAt: -1 });
      
    res.status(200).json(milestones);
  } catch (err) {
    console.error("Kullanıcı milestones alınırken hata:", err);
    res.status(500).json({ message: "Kullanıcı milestones alınırken hata oluştu.", error: err.message });
  }
}

// Get milestones for a specific team
async function getMilestonesByTeamId(req, res) {
  try {
    const { teamId } = req.params;
    
    // Check if user has permission to view team milestones
    // Admin can see any team, team leaders can see their own team
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    
    // Only admin or team's leader can see team milestones
    if (req.user.role !== 'admin' && 
        (req.user.role !== 'team_leader' || String(user.team) !== teamId)) {
      return res.status(403).json({ message: "Bu takımın milestone'larını görüntüleme yetkiniz yok." });
    }
    
    const milestones = await Milestone.find({ team: teamId })
      .populate("assignedTo", "name surname username role")
      .populate("team", "name")
      .sort({ createdAt: -1 });
      
    res.status(200).json(milestones);
  } catch (err) {
    console.error("Takım milestones alınırken hata:", err);
    res.status(500).json({ message: "Takım milestones alınırken hata oluştu.", error: err.message });
  }
}

// Create new milestone (basic function, not for admin assignment)
async function createMilestone(req, res) {
  try {
    const { title, description, assignedTo, team } = req.body;
    
    // Only admin or team leaders can create milestones
    if (req.user.role !== 'admin' && req.user.role !== 'team_leader') {
      return res.status(403).json({ message: "Milestone oluşturma yetkiniz yok." });
    }
    
    // If team leader, they can only assign to their team members
    if (req.user.role === 'team_leader') {
      const teamLeader = await User.findById(req.user.id);
      if (!teamLeader || !teamLeader.team) {
        return res.status(400).json({ message: "Takım bilgisi bulunamadı." });
      }
      
      // Verify that the milestone is for the team leader's team
      if (String(teamLeader.team) !== team) {
        return res.status(403).json({ message: "Sadece kendi takımınıza milestone atayabilirsiniz." });
      }
      
      // Verify that assignedTo user is in the team leader's team
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || String(assignedUser.team) !== String(teamLeader.team)) {
        return res.status(403).json({ message: "Sadece kendi takımınızdaki üyelere milestone atayabilirsiniz." });
      }
    }
    
    const milestone = new Milestone({
      title,
      description,
      assignedTo,
      team,
      status: 'todo'
    });
    
    await milestone.save();
    
    res.status(201).json({ message: "Milestone başarıyla oluşturuldu.", milestone });
  } catch (err) {
    console.error("Milestone oluşturulurken hata:", err);
    res.status(500).json({ message: "Milestone oluşturulurken hata oluştu.", error: err.message });
  }
}

// Admin assigns milestone to team leader
async function assignMilestone(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Sadece adminler milestone atayabilir." });
    }

    const { title, description, assignedTo } = req.body;

    // Verify assigned user is a team leader
    const leader = await User.findById(assignedTo);
    if (!leader || leader.role !== 'team_leader') {
      return res.status(400).json({ message: "Milestone sadece takım liderine atanabilir." });
    }

    const milestone = await Milestone.create({
      title,
      description,
      assignedTo,
      team: leader.team,
      status: 'todo'
    });

    res.status(201).json({ message: "Milestone başarıyla oluşturuldu.", milestone });
  } catch (err) {
    res.status(500).json({ message: "Milestone oluşturulurken hata oluştu.", error: err.message });
  }
}

// Update milestone status (for team leader)
async function updateMilestoneStatus(req, res) {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone bulunamadı." });
    }

    // Check permissions
    // Admin can update any milestone
    // Team leader can only update their own milestones
    if (req.user.role !== 'admin' && String(milestone.assignedTo) !== req.user.id) {
      return res.status(403).json({ message: "Bu milestone'u güncelleme yetkiniz yok." });
    }

    // If status is changing, check permissions for the specific transition
    if (req.body.status && milestone.status !== req.body.status) {
      // Only admin can set status to verified or rejected
      if ((req.body.status === 'verified' || req.body.status === 'rejected') && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Sadece admin onaylama veya reddetme yapabilir." });
      }
      
      // For other transitions, check the allowed transitions
      const allowedTransitions = {
        'todo': ['in-progress', 'on-hold'],
        'in-progress': ['submitted', 'on-hold'],
        'on-hold': ['in-progress', 'todo'],
        'submitted': ['verified', 'rejected'],
        'verified': [],
        'rejected': []
      };
      
      // Check if transition is allowed based on current status
      if (!allowedTransitions[milestone.status].includes(req.body.status)) {
        return res.status(400).json({ 
          message: `${milestone.status} durumundan ${req.body.status} durumuna geçiş yapılamaz.` 
        });
      }
    }

    // Update milestone fields
    if (req.body.title) milestone.title = req.body.title;
    if (req.body.description) milestone.description = req.body.description;
    if (req.body.status) milestone.status = req.body.status;
    
    milestone._modifiedBy = req.user.id;  // Track who modified it
    await milestone.save();

    res.json({ message: "Milestone güncellendi.", milestone });
  } catch (err) {
    console.error("Milestone güncellenirken hata:", err);
    res.status(500).json({ message: "Milestone güncellenirken hata oluştu.", error: err.message });
  }
}

// Delete milestone (admin only)
async function deleteMilestone(req, res) {
  try {
    // Only admin can delete milestones
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Sadece adminler milestone silebilir." });
    }
    
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone bulunamadı." });
    }
    
    await Milestone.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Milestone başarıyla silindi." });
  } catch (err) {
    console.error("Milestone silinirken hata:", err);
    res.status(500).json({ message: "Milestone silinirken hata oluştu.", error: err.message });
  }
}

// Team leader submits milestone
async function submitMilestone(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const milestone = await Milestone.findById(id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone bulunamadı." });
    }
    
    if (req.user.role !== "team_leader" || String(milestone.assignedTo) !== userId) {
      return res.status(403).json({ message: "Sadece takım lideri kendi milestone'unu submit edebilir." });
    }
    
    // Only in-progress milestones can be submitted
    if (milestone.status !== "in-progress") {
      return res.status(400).json({ message: "Sadece çalışma durumundaki milestone'lar submit edilebilir." });
    }
    
    milestone.status = "submitted";
    milestone._modifiedBy = userId;
    await milestone.save();
    
    res.json({ message: "Milestone başarıyla gönderildi.", milestone });
  } catch (err) {
    console.error("Milestone submit edilirken hata:", err);
    res.status(500).json({ message: "Milestone submit edilirken hata oluştu.", error: err.message });
  }
}

// Admin verifies milestone
async function verifyMilestone(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Sadece adminler milestone doğrulayabilir." });
    }

    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone bulunamadı." });
    }
    
    // Only submitted milestones can be verified
    if (milestone.status !== 'submitted') {
      return res.status(400).json({ message: "Sadece gönderilmiş milestone'lar doğrulanabilir." });
    }

    milestone.status = 'verified';
    milestone._modifiedBy = req.user.id;  // Track who verified it
    await milestone.save();

    res.json({ message: "Milestone başarıyla doğrulandı.", milestone });
  } catch (err) {
    console.error("Milestone doğrulanırken hata:", err);
    res.status(500).json({ message: "Milestone doğrulanırken hata oluştu.", error: err.message });
  }
}

// Admin rejects milestone
async function rejectMilestone(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Sadece adminler milestone reddedebilir." });
    }

    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone bulunamadı." });
    }
    
    // Only submitted milestones can be rejected
    if (milestone.status !== 'submitted') {
      return res.status(400).json({ message: "Sadece gönderilmiş milestone'lar reddedilebilir." });
    }

    milestone.status = 'rejected';
    milestone._modifiedBy = req.user.id;  // Track who rejected it
    await milestone.save();

    res.json({ message: "Milestone reddedildi.", milestone });
  } catch (err) {
    console.error("Milestone reddedilirken hata:", err);
    res.status(500).json({ message: "Milestone reddedilirken hata oluştu.", error: err.message });
  }
}

module.exports = {
  getAllMilestones,
  getMilestonesByUserId,
  getMilestonesByTeamId,
  createMilestone,
  assignMilestone,
  updateMilestoneStatus,
  deleteMilestone,
  submitMilestone,
  verifyMilestone,
  rejectMilestone
};