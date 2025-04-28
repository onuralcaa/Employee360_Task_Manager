const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Tüm görevleri getir
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'name email')
            .populate('team', 'name')
            .populate('createdBy', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Görevler getirilirken hata oluştu", error: error.message });
    }
};

// Yeni görev oluştur
exports.assignTask = async (req, res) => {
    try {
        if (req.user.role !== 'team_leader') {
            return res.status(403).json({ message: "Sadece takım liderleri görev atayabilir." });
        }

        const { title, description, assignedTo } = req.body;
        
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
        res.status(500).json({ message: "Görev oluşturulurken hata oluştu.", error: err.message });
    }
};

// Görev durumunu güncelle
exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Görev bulunamadı' });
        }

        task._previousStatus = task.status;
        task.status = status;

        if (status === 'verified' || status === 'rejected') {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Sadece yöneticiler görevleri doğrulayabilir veya reddedebilir' });
            }
            task._modifiedBy = req.user._id;
            task._userRole = req.user.role;
        }

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Görevi doğrula (sadece takım lideri)
exports.verifyTask = async (req, res) => {
    try {
        if (req.user.role !== 'team_leader') {
            return res.status(403).json({ message: "Sadece takım liderleri görev doğrulayabilir." });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Görev bulunamadı." });
        }

        if (String(task.team) !== String(req.user.team)) {
            return res.status(403).json({ message: "Bu görevi doğrulama yetkiniz yok." });
        }

        task.status = 'verified';
        await task.save();

        res.json({ message: "Görev doğrulandı.", task });
    } catch (err) {
        res.status(500).json({ message: "Görev doğrulanırken hata oluştu.", error: err.message });
    }
};