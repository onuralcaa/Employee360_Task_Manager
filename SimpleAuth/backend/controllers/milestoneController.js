const Milestone = require("../models/milestoneModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

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
    
    // Only admin or the team leader themselves can view milestones
    if (req.user.role !== 'admin') {
      // Check if request is from a team leader viewing their own milestones
      if (req.user.role !== 'team_leader' || req.user.id !== userId) {
        return res.status(403).json({ message: "Başka kullanıcıların milestone'larını görüntüleme yetkiniz yok." });
      }
    }
    
    // Verify that the requested user is actually a team leader
    const requestedUser = await User.findById(userId);
    if (!requestedUser || requestedUser.role !== 'team_leader') {
      return res.status(400).json({ message: "Sadece takım liderlerinin milestone'ları vardır." });
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

// Create new milestone (admin only function)
async function createMilestone(req, res) {
  try {
    const { title, description, assignedTo } = req.body;
    
    // Only admin can create milestones
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Milestone oluşturma yetkiniz yok. Sadece yöneticiler milestone oluşturabilir." });
    }

    // Verify assigned user is a team leader
    const leader = await User.findById(assignedTo);
    if (!leader || leader.role !== 'team_leader') {
      return res.status(400).json({ message: "Milestone sadece takım liderine atanabilir." });
    }

    const milestone = new Milestone({
      title,
      description,
      assignedTo,
      team: leader.team,
      status: 'todo'
    });
    
    await milestone.save();
    
    // Send email notification to the team leader
    try {
      if (leader && leader.email) {
        const admin = await User.findById(req.user.id);
        
        const emailContent = `
          <h3>Yeni Milestone Atandı</h3>
          <p>Merhaba ${leader.name} ${leader.surname},</p>
          <p>Size yönetici tarafından yeni bir milestone atandı:</p>
          <div style="background-color:#f5f5f5; padding:15px; border-radius:5px; margin:10px 0;">
            <h4 style="margin-top:0; color:#333;">${title}</h4>
            <p>${description || 'Açıklama yok'}</p>
            <p><strong>Atayan:</strong> ${admin ? admin.name + ' ' + admin.surname : 'Yönetici'}</p>
            <p><strong>Durum:</strong> Bekliyor</p>
          </div>
          <p style="color:#0277bd; font-weight:bold;">Bu milestone sizin takım liderliğinizdeki proje süreci için önemlidir.</p>
          <p>Milestone'larınızı kontrol etmek için lütfen sisteme giriş yapın.</p>
        `;

        await sendEmail({
          to: leader.email,
          subject: "Milestone Atandı: " + title,
          html: emailContent
        });
        
        console.log(`✅ Takım liderine milestone atama e-postası gönderildi: ${leader.email}`);
      }
    } catch (emailError) {
      console.error("❌ Takım liderine milestone atama e-postası gönderilirken hata:", emailError);
      // Continue execution even if email fails
    }
    
    res.status(201).json({ message: "Milestone başarıyla oluşturuldu.", milestone });
  } catch (err) {
    console.error("Milestone oluşturulurken hata:", err);
    res.status(500).json({ message: "Milestone oluşturulurken hata oluştu.", error: err.message });
  }
}

// Update milestone status (admin or assigned team leader only)
async function updateMilestoneStatus(req, res) {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone bulunamadı." });
    }

    // Check permissions
    // Admin can update any milestone
    // Team leader can only update their own milestones
    if (req.user.role !== 'admin' && 
        (req.user.role !== 'team_leader' || String(milestone.assignedTo) !== req.user.id)) {
      return res.status(403).json({ message: "Bu milestone'u güncelleme yetkiniz yok." });
    }

    // If status is changing, check permissions for the specific transition
    if (req.body.status && milestone.status !== req.body.status) {
      // Only admin can set status to verified or rejected
      if ((req.body.status === 'verified' || req.body.status === 'rejected') && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Sadece admin onaylama veya reddetme yapabilir." });
      }
      
      // For team leaders, check allowed transitions
      if (req.user.role === 'team_leader') {
        const allowedTeamLeaderTransitions = {
          'todo': ['in-progress', 'on-hold'],
          'in-progress': ['submitted', 'on-hold'],
          'on-hold': ['in-progress', 'todo'],
          'submitted': [], // Once submitted, only admin can change status
          'verified': [], // Cannot be changed
          'rejected': [] // Cannot be changed
        };
        
        if (!allowedTeamLeaderTransitions[milestone.status].includes(req.body.status)) {
          return res.status(400).json({ 
            message: `${milestone.status} durumundan ${req.body.status} durumuna geçiş yapamazsınız.` 
          });
        }
      }
    }

    const previousStatus = milestone.status;
    // Update milestone fields
    if (req.body.title) milestone.title = req.body.title;
    if (req.body.description) milestone.description = req.body.description;
    if (req.body.status) milestone.status = req.body.status;
    
    milestone._modifiedBy = req.user.id;  // Track who modified it
    await milestone.save();

    // Send email notifications for status changes
    try {
      // For admin changing status
      if (req.user.role === 'admin' && previousStatus !== milestone.status) {
        const teamLeader = await User.findById(milestone.assignedTo);
        const admin = await User.findById(req.user.id);
        
        if (teamLeader && teamLeader.email) {
          let emailSubject = "";
          let statusMessage = "";
          
          // Configure notification based on new status
          if (milestone.status === "on-hold") {
            emailSubject = "Milestone Beklemede: " + milestone.title;
            statusMessage = "<p style='color:#ff9800; font-weight:bold;'>Milestone'unuz şu anda beklemededir.</p>";
          } else if (milestone.status === "verified") {
            emailSubject = "Milestone Onaylandı: " + milestone.title;
            statusMessage = "<p style='color:#4caf50; font-weight:bold;'>Milestone'unuz başarıyla onaylandı.</p>";
          } else if (milestone.status === "rejected") {
            emailSubject = "Milestone Reddedildi: " + milestone.title;
            statusMessage = "<p style='color:#f44336; font-weight:bold;'>Milestone'unuz reddedildi. Lütfen tekrar gözden geçiriniz.</p>";
          } else {
            emailSubject = "Milestone Durumu Güncellendi: " + milestone.title;
            statusMessage = `<p>Milestone'unuzun durumu <strong>${previousStatus}</strong>'dan <strong>${milestone.status}</strong>'a değiştirildi.</p>`;
          }
          
          const emailContent = `
            <h3>Milestone Durumu Güncellendi</h3>
            <p>Merhaba ${teamLeader.name} ${teamLeader.surname},</p>
            <p>Bir milestone'unuzun durumu yönetici tarafından değiştirildi:</p>
            <div style="background-color:#f5f5f5; padding:15px; border-radius:5px; margin:10px 0;">
              <h4 style="margin-top:0; color:#333;">${milestone.title}</h4>
              <p>${milestone.description || 'Açıklama yok'}</p>
              <p><strong>Önceki Durum:</strong> ${previousStatus}</p>
              <p><strong>Yeni Durum:</strong> ${milestone.status}</p>
              <p><strong>Güncelleyen:</strong> ${admin ? admin.name + ' ' + admin.surname : 'Yönetici'}</p>
            </div>
            ${statusMessage}
            <p>Milestone'larınızı kontrol etmek için lütfen sisteme giriş yapın.</p>
          `;

          await sendEmail({
            to: teamLeader.email,
            subject: emailSubject,
            html: emailContent
          });
          
          console.log(`✅ Milestone durum güncelleme e-postası gönderildi: ${teamLeader.email}`);
        }
      } 
      // For team leader submitting a milestone (notify admins)
      else if (req.user.role === 'team_leader' && milestone.status === 'submitted' && previousStatus === 'in-progress') {
        // Find admin users to notify
        const admins = await User.find({ role: "admin" });
        const teamLeader = await User.findById(req.user.id);
        
        if (admins.length > 0 && teamLeader) {
          const emailContent = `
            <h3>Milestone İnceleme Talebi</h3>
            <p>Merhaba Yönetici,</p>
            <p>${teamLeader.name} ${teamLeader.surname} bir milestone'u incelemeniz için gönderdi:</p>
            <div style="background-color:#f5f5f5; padding:15px; border-radius:5px; margin:10px 0;">
              <h4 style="margin-top:0; color:#333;">${milestone.title}</h4>
              <p>${milestone.description || 'Açıklama yok'}</p>
              <p><strong>Takım Lideri:</strong> ${teamLeader.name} ${teamLeader.surname}</p>
              <p><strong>Önceki Durum:</strong> ${previousStatus}</p>
              <p><strong>Yeni Durum:</strong> İncelemeye Gönderildi</p>
            </div>
            <p>Lütfen bu milestone'u inceleyip onaylayın veya reddedin.</p>
          `;

          // Send to all admins
          for (const admin of admins) {
            if (admin.email) {
              await sendEmail({
                to: admin.email,
                subject: "Milestone İnceleme Talebi: " + milestone.title,
                html: emailContent
              });
              
              console.log(`✅ Milestone inceleme talebi e-postası gönderildi: ${admin.email}`);
            }
          }
        }
      }
    } catch (emailError) {
      console.error("❌ Milestone durum güncelleme e-postası gönderilirken hata:", emailError);
      // Continue execution even if email fails
    }

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

module.exports = {
  getAllMilestones,
  getMilestonesByUserId,
  getMilestonesByTeamId,
  createMilestone,
  updateMilestoneStatus,
  deleteMilestone
};