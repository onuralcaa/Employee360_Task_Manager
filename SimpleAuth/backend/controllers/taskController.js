const Task = require("../models/taskModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

// Get all tasks with proper filtering based on user role
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let filter = {};

    // Admin sees all tasks
    if (userRole === "admin") {
      // No filter needed, all tasks
    } 
    // Team leader sees tasks for their team
    else if (userRole === "team_leader") {
      // Get user's team
      const user = await User.findById(userId);
      if (!user || !user.team) {
        return res.status(400).json({ message: "Kullanıcı takım bilgisi bulunamadı" });
      }
      filter.team = user.team;
    }
    // Regular users see tasks assigned to them or created by them
    else {
      filter = {
        $or: [
          { assignedTo: userId },
          { createdBy: userId }
        ]
      };
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name surname")
      .populate("team", "name")
      .populate("createdBy", "name surname")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Görevler alınırken hata:", error);
    res.status(500).json({ message: "Görevler alınırken sunucu hatası oluştu", error: error.message });
  }
};

// Get tasks for a specific user (new function)
const getTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!userId) {
      return res.status(400).json({ message: "Kullanıcı ID'si gereklidir" });
    }

    // Find tasks assigned to this user or created by this user
    const tasks = await Task.find({
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    })
    .populate("assignedTo", "name surname")
    .populate("team", "name")
    .populate("createdBy", "name surname")
    .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Kullanıcı görevleri alınırken hata:", error);
    res.status(500).json({ message: "Kullanıcı görevleri alınırken sunucu hatası oluştu", error: error.message });
  }
};

// Create task with role validation
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, team } = req.body;
    const createdBy = req.user.id;

    // Validate required fields
    if (!title || !assignedTo || !team) {
      return res.status(400).json({ message: "Lütfen gerekli alanları doldurunuz" });
    }

    // Validate permissions (only team leaders can create tasks)
    if (req.user.role !== "team_leader") {
      return res.status(403).json({ message: "Sadece takım liderleri görev oluşturabilir" });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      team,
      createdBy,
      status: "todo" // Default status
    });

    await task.save();

    // Send email notification to the assigned user
    try {
      const assignedUser = await User.findById(assignedTo);
      const teamLeader = await User.findById(createdBy);
      
      if (assignedUser && assignedUser.email) {
        const emailContent = `
          <h3>Yeni Görev Atandı</h3>
          <p>Merhaba ${assignedUser.name} ${assignedUser.surname},</p>
          <p>Size yeni bir görev atandı:</p>
          <div style="background-color:#f5f5f5; padding:15px; border-radius:5px; margin:10px 0;">
            <h4 style="margin-top:0; color:#333;">${title}</h4>
            <p>${description || 'Açıklama yok'}</p>
            <p><strong>Atayan:</strong> ${teamLeader ? teamLeader.name + ' ' + teamLeader.surname : 'Takım Lideri'}</p>
            <p><strong>Durum:</strong> Bekliyor</p>
          </div>
          <p>Görevlerinizi kontrol etmek için lütfen sisteme giriş yapın.</p>
        `;

        await sendEmail({
          to: assignedUser.email,
          subject: "Yeni Görev Atandı: " + title,
          html: emailContent
        });
        
        console.log(`✅ Görev atama e-postası gönderildi: ${assignedUser.email}`);
      }
    } catch (emailError) {
      console.error("❌ Görev atama e-postası gönderilirken hata:", emailError);
      // Continue execution even if email fails
    }
    
    res.status(201).json({ message: "Görev başarıyla oluşturuldu", task });
  } catch (error) {
    console.error("Görev oluşturulurken hata:", error);
    res.status(500).json({ message: "Görev oluşturulurken sunucu hatası oluştu", error: error.message });
  }
};

// Update task status with validation
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['todo', 'in-progress', 'on-hold', 'done', 'verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Geçersiz durum değeri" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı" });
    }

    // Regular users can only update tasks assigned to them and only to certain statuses
    if (req.user.role === "personel") {
      // Make sure user is assigned to this task
      if (task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ message: "Sadece görevin atandığı kişi durumu değiştirebilir" });
      }
      
      // Regular users can only change todo→in-progress, in-progress→done
      if (
        (task.status === "todo" && status === "in-progress") ||
        (task.status === "in-progress" && status === "done")
      ) {
        // These transitions are allowed
      } else {
        return res.status(403).json({ message: "Bu durum değişikliği için yetkiniz yok" });
      }
    } 
    // Team leaders can only assign, hold, resume, verify and reject tasks
    else if (req.user.role === "team_leader") {
      // Team leaders CANNOT start or complete tasks
      if (
        (task.status === "todo" && status === "in-progress") ||
        (task.status === "in-progress" && status === "done")
      ) {
        return res.status(403).json({ 
          message: "Takım liderleri görevleri başlatamaz veya tamamlayamaz, bu işlemler çalışanlar tarafından yapılmalıdır" 
        });
      }
      
      // Team leaders can put tasks on hold or resume them
      // Team leaders can verify or reject completed tasks
      // Team leaders can reassign tasks (to todo state)
      if (
        (task.status === "todo" && status === "on-hold") ||
        (task.status === "on-hold" && status === "todo") ||
        (task.status === "done" && status === "verified") ||
        (task.status === "done" && status === "rejected") ||
        (status === "todo") // For reassignment
      ) {
        // These transitions are allowed
      } else {
        return res.status(403).json({ 
          message: "Bu durum değişikliği için yetkiniz yok" 
        });
      }
    }
    // Admins can only view tasks, not edit them
    else if (req.user.role === "admin") {
      return res.status(403).json({ message: "Yöneticiler görev durumlarını düzenleyemez, sadece görüntüleyebilir" });
    }
    // Any other role (should not happen, but as a safeguard)
    else {
      return res.status(403).json({ message: "Bu durum değişikliği için yetkiniz yok" });
    }
    

    const previousStatus = task.status;
    task.status = status;
    task._modifiedBy = req.user.id;
    await task.save();

    // Send email notification for significant status changes
    try {
      const assignedUser = await User.findById(task.assignedTo);
      const updatedBy = await User.findById(req.user.id);
      
      if (assignedUser && assignedUser.email) {
        let shouldSendEmail = false;
        let emailSubject = "";
        let statusMessage = "";
        
        // Determine email subject and message based on status change
        if (status === "on-hold") {
          shouldSendEmail = true;
          emailSubject = "Görev Beklemede: " + task.title;
          statusMessage = "<p style='color:#ff9800; font-weight:bold;'>Göreviniz şu anda beklemededir.</p>";
        } else if (status === "verified") {
          shouldSendEmail = true;
          emailSubject = "Görev Onaylandı: " + task.title;
          statusMessage = "<p style='color:#4caf50; font-weight:bold;'>Göreviniz başarıyla onaylandı.</p>";
        } else if (status === "rejected") {
          shouldSendEmail = true;
          emailSubject = "Görev Reddedildi: " + task.title;
          statusMessage = "<p style='color:#f44336; font-weight:bold;'>Göreviniz reddedildi. Lütfen tekrar gözden geçiriniz.</p>";
        }
        
        if (shouldSendEmail) {
          const emailContent = `
            <h3>Görev Durumu Güncellendi</h3>
            <p>Merhaba ${assignedUser.name} ${assignedUser.surname},</p>
            <p>Bir görevinizin durumu değiştirildi:</p>
            <div style="background-color:#f5f5f5; padding:15px; border-radius:5px; margin:10px 0;">
              <h4 style="margin-top:0; color:#333;">${task.title}</h4>
              <p>${task.description || 'Açıklama yok'}</p>
              <p><strong>Önceki Durum:</strong> ${previousStatus}</p>
              <p><strong>Yeni Durum:</strong> ${status}</p>
              <p><strong>Güncelleyen:</strong> ${updatedBy ? updatedBy.name + ' ' + updatedBy.surname : 'Sistem Kullanıcısı'}</p>
            </div>
            ${statusMessage}
            <p>Görevlerinizi kontrol etmek için lütfen sisteme giriş yapın.</p>
          `;

          await sendEmail({
            to: assignedUser.email,
            subject: emailSubject,
            html: emailContent
          });
          
          console.log(`✅ Görev durum güncelleme e-postası gönderildi: ${assignedUser.email}`);
        }
      }
    } catch (emailError) {
      console.error("❌ Görev durum güncelleme e-postası gönderilirken hata:", emailError);
      // Continue execution even if email fails
    }

    res.status(200).json({ message: "Görev durumu güncellendi", task });
  } catch (error) {
    console.error("Görev durumu güncellenirken hata:", error);
    res.status(500).json({ message: "Görev durumu güncellenirken sunucu hatası oluştu", error: error.message });
  }
};

module.exports = {
  getAllTasks,
  getTasksByUserId, // Add the new function to exports
  createTask,
  updateTaskStatus
};