const Task = require("../models/taskModel");
const User = require("../models/userModel");

// Team leader assigns task
async function assignTask(req, res) {
  try {
    // Verify team leader role
    if (req.user.role !== 'team_leader') {
      return res.status(403).json({ message: "Sadece takım liderleri görev atayabilir." });
    }

    const { title, description, assignedTo } = req.body;
    
    // Create task with team info from leader
    const task = await Task.create({
      title,
      description,
      assignedTo,
      createdBy: req.user.id,
      team: req.user.team,
      status: 'todo'
    });

    res.status(201).json({ message: "Görev başarıyla oluşturuldu.", task });
  } catch (err) {
    if (err.message === 'User must be a member of the team') {
      return res.status(400).json({ message: "Kullanıcı takım üyesi olmalıdır." });
    }
    res.status(500).json({ message: "Görev oluşturulurken hata oluştu.", error: err.message });
  }
}

// Update task status
async function updateTaskStatus(req, res) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı." });
    }

    // Only assigned user can update their task
    if (String(task.assignedTo) !== req.user.id) {
      return res.status(403).json({ message: "Bu görevi güncelleme yetkiniz yok." });
    }

    task.status = req.body.status;
    await task.save();

    res.json({ message: "Görev durumu güncellendi.", task });
  } catch (err) {
    if (err.message === 'Invalid status transition') {
      return res.status(400).json({ message: "Geçersiz durum değişikliği." });
    }
    res.status(500).json({ message: "Görev güncellenirken hata oluştu.", error: err.message });
  }
}

// Team leader verifies task
async function verifyTask(req, res) {
  try {
    // Verify team leader role
    if (req.user.role !== 'team_leader') {
      return res.status(403).json({ message: "Sadece takım liderleri görev doğrulayabilir." });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı." });
    }

    // Verify task belongs to leader's team
    if (String(task.team) !== String(req.user.team)) {
      return res.status(403).json({ message: "Bu görevi doğrulama yetkiniz yok." });
    }

    task.status = 'verified';
    await task.save();

    res.json({ message: "Görev doğrulandı.", task });
  } catch (err) {
    if (err.message === 'Invalid status transition') {
      return res.status(400).json({ message: "Sadece 'done' durumundaki görevler doğrulanabilir." });
    }
    res.status(500).json({ message: "Görev doğrulanırken hata oluştu.", error: err.message });
  }
}

module.exports = {
  assignTask,
  updateTaskStatus,
  verifyTask
};