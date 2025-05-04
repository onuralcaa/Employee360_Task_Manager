const Task = require("../models/taskModel");
const User = require("../models/userModel");

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
      
      // Regular users can only change todo→in-progress, in-progress→done, on-hold→in-progress
      if (
        (task.status === "todo" && status === "in-progress") ||
        (task.status === "in-progress" && status === "done") ||
        (task.status === "on-hold" && status === "in-progress")
      ) {
        // These transitions are allowed
      } else {
        return res.status(403).json({ message: "Bu durum değişikliği için yetkiniz yok" });
      }
    } 
    // Admin can verify or reject completed tasks
    else if (req.user.role === "admin" && (status === "verified" || status === "rejected")) {
      if (task.status !== "done") {
        return res.status(400).json({ message: "Sadece tamamlanmış görevler onaylanabilir veya reddedilebilir" });
      }
    }
    // Team leaders can make any status change
    else if (req.user.role !== "team_leader") {
      return res.status(403).json({ message: "Bu durum değişikliği için yetkiniz yok" });
    }

    task.status = status;
    task._modifiedBy = req.user.id;
    await task.save();

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