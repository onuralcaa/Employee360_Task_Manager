const Milestone = require("../models/milestoneModel");
const User = require("../models/userModel");

// Admin assigns milestone to team leader
async function assignMilestone(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Sadece adminler milestone atayabilir." });
    }

    const { title, description, assignedTo } = req.body;

    const verifyMilestone = async (req, res) => {
      try {
        const { id } = req.params;
        const milestone = await Milestone.findById(id);
        
        if (!milestone) {
          return res.status(404).json({ message: 'Milestone not found' });
        }
    
        if (req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Only admins can verify milestones' });
        }
    
        milestone.status = 'verified';
        milestone._modifiedBy = req.user._id;
        milestone._userRole = req.user.role;  // Add user role for validation
        
        await milestone.save();
        res.json({ message: 'Milestone verified successfully', milestone });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

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

    // Only assigned leader can update their milestone
    if (String(milestone.assignedTo) !== req.user.id) {
      return res.status(403).json({ message: "Bu milestone'u güncelleme yetkiniz yok." });
    }

    milestone.status = req.body.status;
    milestone._modifiedBy = req.user.id;  // Track who modified it
    await milestone.save();

    res.json({ message: "Milestone durumu güncellendi.", milestone });
  } catch (err) {
    if (err.message === 'Invalid status transition') {
      return res.status(400).json({ message: "Geçersiz durum değişikliği." });
    }
    if (err.message === 'Only team leaders can submit milestones') {
      return res.status(403).json({ message: "Sadece takım liderleri milestone submit edebilir." });
    }
    res.status(500).json({ message: "Milestone güncellenirken hata oluştu.", error: err.message });
  }
}

async function submitMilestone(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const milestone = await Milestone.findById(id);
    if (!milestone) return res.status(404).json({ message: "Milestone bulunamadı." });
    if (req.user.role !== "team_leader" || String(milestone.assignedTo) !== userId)
      return res.status(403).json({ message: "Sadece takım lideri milestone submit edebilir." });
    milestone.status = "submitted";
    await milestone.save();
    res.json({ message: "Milestone gönderildi.", milestone });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası.", error: err });
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

    milestone.status = 'verified';
    milestone._modifiedBy = req.user.id;  // Track who verified it
    await milestone.save();

    res.json({ message: "Milestone doğrulandı.", milestone });
  } catch (err) {
    if (err.message === 'Invalid status transition') {
      return res.status(400).json({ message: "Sadece 'submit' durumundaki milestone'lar doğrulanabilir." });
    }
    res.status(500).json({ message: "Milestone doğrulanırken hata oluştu.", error: err.message });
  }
}

module.exports = {
  assignMilestone,
  updateMilestoneStatus,
  submitMilestone,
  verifyMilestone
};