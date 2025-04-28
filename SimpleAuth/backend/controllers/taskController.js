const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Takım liderleri personele görev atar
async function assignTask(req, res) {
    const leaderID = req.user.id;
    const { title, description, assignedTo } = req.body;

    try {
        // Takım lideri sadece kendi takımına görev atayabilir
        const member = await User.findOne({ _id: assignedTo, team: req.user.team });
        if (!member) return res.status(403).json({ message: 'Bu kullanıcıya görev atama izniniz yok' });
        // Sadece takım lideri görev atayabilir
        if (req.user.role !== 'team_leader') return res.status(403).json({ message: 'Bu görevi atama izniniz yok' });
        if (!leader || leader.role !== 'team_leader') return res.status(403).json({ message: 'Bu görevi atama izniniz yok' });
        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser || assignedUser.role !== 'personnel') return res.status(403).json({ message: 'Bu kullanıcıya görev atama izniniz yok' });
        if (String(assignedUser.team) !== String(leader.team)) return res.status(403).json({ message: 'Bu kullanıcı sizin takımınıza ait değil' });
        // Görev oluştur
        const task = await Task.create({
            title,
            description,
            assignedTo,
            createdBy: leaderID,
            status: 'to-do',
            team: req.user.team
        });
        res.status(201).json({ message: 'Görev atandı', task });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Görev atama sırasında hata oluştu', error: err });
    }
}   

// Personeller için izin verilen task güncellemeleri
const allowedTransitions = {
    'to-do': ['in-progress', 'on-hold'],
    'in-progress': ['on-hold', 'done'],
    'on-hold': ['in-progress', 'to-do'],
    'done': [],
    'verified': []
};

async function updateTaskStatus(req, res) {
    const userID = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Task'ı bul
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });
        
        if (String(task.assignedTo) !== userID) return res.status(403).json({ message: 'Bu görevi güncelleme izniniz yok' });

        if (!allowedTransitions[task.status].includes(status)) return res.status(400).json({ message: 'Bu geçiş izinsiz' });
        
        task.status = status;
        await task.save();
        res.json({ message: 'Görev durumu güncellendi', task });
    }   catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Görev durumu güncellenirken hata oluştu' });
    }
    }

    async function verifyTasks(req, res) {
        const userId = req.user.id;
        const { id } = req.params;

        try {
            // Task'ı bul
            const task = await Task.findById(id);
            if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });

            // Sadece takımın lideri görevleri onaylayabilir
            if (req.user.role !== 'team_leader' || String(task.team) !== String(req.user.team)) return res.status(403).json({ message: 'Bu görevi onaylama izniniz yok' });
            
            // Görev durumu 'done' olmalı
            if (task.status !== 'done') return res.status(400).json({ message: 'Görev durumu onaylanamaz' });

            task.status = 'verified';
            await task.save();
            res.json({ message: 'Görev doğrulandı', task });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Görev doğrulama sırasında hata oluştu', error: err });
        }
    }

    module.exports = {
        updateTaskStatus,
        verifyTasks,
        assignTask
    };