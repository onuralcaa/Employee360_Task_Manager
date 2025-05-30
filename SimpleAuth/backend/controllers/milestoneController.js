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
    if (req.user.role !== 'admin' && String(milestone.assignedTo) !== req.user.id) {
      return res.status(403).json({ message: "Bu milestone'u güncelleme yetkiniz yok." });
    }

    // Validate status transitions for team leaders
    if (req.user.role === 'team_leader') {
      const allowedTransitions = {
        'todo': ['in-progress', 'on-hold'],
        'in-progress': ['submitted', 'on-hold'],
        'on-hold': ['in-progress', 'todo'],
      };

      if (!allowedTransitions[milestone.status]?.includes(req.body.status)) {
        return res.status(400).json({ 
          message: `${milestone.status} durumundan ${req.body.status} durumuna geçiş yapamazsınız.` 
        });
      }
    }

    // Update milestone fields
    if (req.body.status) milestone.status = req.body.status;
    milestone._modifiedBy = req.user.id;
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

// Admin assigns milestone to team leader
async function assignMilestone(req, res) {
  try {
    // Log the full request body for debugging
    console.log("⭐ assignMilestone: Request received", JSON.stringify(req.body, null, 2));
    
    const { title, description, assignedTo } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Başlık gereklidir." });
    }
    
    if (!assignedTo) {
      return res.status(400).json({ message: "Takım lideri seçilmelidir." });
    }
    
    // Only admin can assign milestones
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Milestone atama yetkiniz yok. Sadece yöneticiler milestone atayabilir." });
    }

    // Verify assigned user is a team leader
    const leader = await User.findById(assignedTo);
    
    if (!leader) {
      return res.status(404).json({ message: "Belirtilen takım lideri bulunamadı." });
    }
    
    if (leader.role !== 'team_leader') {
      return res.status(400).json({ message: "Milestone sadece takım liderine atanabilir." });
    }
    
    // Check if the team leader has a team assigned
    if (!leader.team) {
      return res.status(400).json({ message: "Seçilen takım liderinin bir takımı yok. Önce takım liderine bir takım atayın." });
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
    
    console.log("✅ Milestone başarıyla oluşturuldu:", milestone);
    res.status(201).json({ message: "Milestone başarıyla atandı.", milestone });
  } catch (err) {
    console.error("Milestone atanırken hata:", err);
    
    // Provide more specific error messages based on the error type
    if (err.name === 'ValidationError') {
      // Handle Mongoose validation errors
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        message: "Milestone atanırken doğrulama hatası oluştu.", 
        details: validationErrors.join(', ') 
      });
    } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
      return res.status(400).json({ message: "Geçersiz ID formatı." });
    }
    
    res.status(500).json({ message: "Milestone atanırken hata oluştu.", error: err.message });
  }
}

// Team leader submits milestone
async function submitMilestone(req, res) {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone bulunamadı." });
    }

    // Only the assigned team leader can submit their milestone
    if (req.user.role !== 'team_leader' || milestone.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu milestone'u gönderme yetkiniz yok." });
    }

    // Check if milestone is in a submittable state
    if (milestone.status !== 'in-progress') {
      return res.status(400).json({ 
        message: "Sadece 'In Progress' durumundaki milestone'lar gönderilebilir." 
      });
    }

    milestone.status = 'submitted';
    milestone._modifiedBy = req.user.id;
    await milestone.save();

    // Notify admins about the submission
    try {
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
          }
        }
      }
    } catch (emailError) {
      console.error("❌ Milestone inceleme talebi e-postası gönderilirken hata:", emailError);
      // Continue execution even if email fails
    }

    res.json({ message: "Milestone başarıyla gönderildi ve incelemeye alındı.", milestone });
  } catch (err) {
    console.error("Milestone gönderilirken hata:", err);
    res.status(500).json({ message: "Milestone gönderilirken hata oluştu.", error: err.message });
  }
}

// Admin verifies milestone
async function verifyMilestone(req, res) {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone bulunamadı." });
    }

    // Only admin can verify milestones
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Milestone onaylama yetkiniz yok. Sadece yöneticiler milestone onaylayabilir." });
    }

    // Check if milestone is in a verifiable state
    if (milestone.status !== 'submitted') {
      return res.status(400).json({ 
        message: "Sadece 'Submitted' durumundaki milestone'lar onaylanabilir." 
      });
    }

    milestone.status = 'verified';
    milestone._modifiedBy = req.user.id;
    await milestone.save();

    // Notify team leader about the verification
    try {
      const teamLeader = await User.findById(milestone.assignedTo);
      const admin = await User.findById(req.user.id);
      
      if (teamLeader && teamLeader.email) {
        const emailContent = `
          <h3>Milestone Onaylandı</h3>
          <p>Merhaba ${teamLeader.name} ${teamLeader.surname},</p>
          <p>Gönderdiğiniz milestone yönetici tarafından onaylandı:</p>
          <div style="background-color:#f5f5f5; padding:15px; border-radius:5px; margin:10px 0;">
            <h4 style="margin-top:0; color:#333;">${milestone.title}</h4>
            <p>${milestone.description || 'Açıklama yok'}</p>
            <p><strong>Onaylayan:</strong> ${admin ? admin.name + ' ' + admin.surname : 'Yönetici'}</p>
          </div>
          <p style="color:#4caf50; font-weight:bold;">Tebrikler! Milestone'unuz başarıyla tamamlandı.</p>
        `;

        await sendEmail({
          to: teamLeader.email,
          subject: "Milestone Onaylandı: " + milestone.title,
          html: emailContent
        });
      }
    } catch (emailError) {
      console.error("❌ Milestone onay e-postası gönderilirken hata:", emailError);
      // Continue execution even if email fails
    }

    res.json({ message: "Milestone başarıyla onaylandı.", milestone });
  } catch (err) {
    console.error("Milestone onaylanırken hata:", err);
    res.status(500).json({ message: "Milestone onaylanırken hata oluştu.", error: err.message });
  }
}

// Admin rejects milestone
async function rejectMilestone(req, res) {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone bulunamadı." });
    }

    // Only admin can reject milestones
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Milestone reddetme yetkiniz yok. Sadece yöneticiler milestone reddedebilir." });
    }

    // Check if milestone is in a rejectable state
    if (milestone.status !== 'submitted') {
      return res.status(400).json({ 
        message: "Sadece 'Submitted' durumundaki milestone'lar reddedilebilir." 
      });
    }

    milestone.status = 'rejected';
    milestone._modifiedBy = req.user.id;
    
    // Add rejection reason if provided
    if (req.body.reason) {
      milestone.rejectionReason = req.body.reason;
    }
    
    await milestone.save();

    // Notify team leader about the rejection
    try {
      const teamLeader = await User.findById(milestone.assignedTo);
      const admin = await User.findById(req.user.id);
      
      if (teamLeader && teamLeader.email) {
        const emailContent = `
          <h3>Milestone Reddedildi</h3>
          <p>Merhaba ${teamLeader.name} ${teamLeader.surname},</p>
          <p>Gönderdiğiniz milestone yönetici tarafından reddedildi:</p>
          <div style="background-color:#f5f5f5; padding:15px; border-radius:5px; margin:10px 0;">
            <h4 style="margin-top:0; color:#333;">${milestone.title}</h4>
            <p>${milestone.description || 'Açıklama yok'}</p>
            <p><strong>Reddeden:</strong> ${admin ? admin.name + ' ' + admin.surname : 'Yönetici'}</p>
            ${milestone.rejectionReason ? `<p><strong>Red Nedeni:</strong> ${milestone.rejectionReason}</p>` : ''}
          </div>
          <p style="color:#f44336; font-weight:bold;">Lütfen gerekli düzeltmeleri yapıp milestone'u tekrar gönderin.</p>
          <p>Milestone'u düzenlemek için, durumunu önce "In Progress" olarak değiştirmeniz gerekecektir.</p>
        `;

        await sendEmail({
          to: teamLeader.email,
          subject: "Milestone Reddedildi: " + milestone.title,
          html: emailContent
        });
      }
    } catch (emailError) {
      console.error("❌ Milestone red e-postası gönderilirken hata:", emailError);
      // Continue execution even if email fails
    }

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
  updateMilestoneStatus,
  deleteMilestone,
  assignMilestone,
  submitMilestone,
  verifyMilestone,
  rejectMilestone
};