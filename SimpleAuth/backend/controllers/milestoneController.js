const Milestone = require("../models/milestoneModel");

async function submitMilestone(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
  try {
    const milestone = await Milestone.findById(id);
    if (!milestone) return res.status(404).json({ message: "Milestone bulunamadı!" });
    if (String(milestone.assignedTo) !== userId) return res.status(403).json({ message: "Bu milestone'u göndermeye yetkiniz yok!" });
    
    milestone.status = "submitted";
    await milestone.save();
    res.json({ message: "Milestone başarıyla gönderildi!", milestone });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası!", error: err });
  }
}

//Admin milestone'u onaylar
async function approveMilestone(req, res) {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Bu işlemi gerçekleştirmeye yetkiniz yok!" });
    const { id } = req.params;
    try {
        const milestone = await Milestone.findById(id);
        if (!milestone) return res.status(404).json({ message: "Milestone bulunamadı!" });
        if (milestone.status !== "submitted") return res.status(400).json({ message: "Bu milestone henüz gönderilmedi!" });
        milestone.status = "verified";
        await milestone.save();
        res.json({ message: "Milestone başarıyla doğrulandı!", milestone });
    }
    catch (err) {
        res.status(500).json({ message: "Sunucu hatası!", error: err });
    }
}

module.exports = {
    submitMilestone,
    approveMilestone,
};