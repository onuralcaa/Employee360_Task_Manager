const Report = require('../models/reportModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const Team = require('../models/teamModel');
const fs = require('fs');
const path = require('path');
const sendEmail = require('../utils/sendEmail');

// Create a new report
const createReport = async (req, res) => {
  try {
    const { title, introduction, periodStart, periodEnd } = req.body;
    
    // Verify user is a team leader
    if (req.user.role !== 'team_leader' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Sadece takım liderleri rapor oluşturabilir' });
    }
    
    // Get user's team
    const user = await User.findById(req.user.id);
    if (!user || !user.team) {
      return res.status(404).json({ message: 'Kullanıcı veya takım bulunamadı' });
    }
    
    // Get team details
    const team = await Team.findById(user.team);
    if (!team) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }
    
    // Generate report content
    const contentObject = await generateReportContent(user.team, new Date(periodStart), new Date(periodEnd));
    // Convert the content object to a JSON string
    const content = JSON.stringify(contentObject);
    
    // Calculate default period dates if not provided
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    const startDate = periodStart ? new Date(periodStart) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before end date
    
    const report = new Report({
      title,
      team: user.team,
      teamLeader: req.user.id,
      introduction,
      content,
      periodStart: startDate,
      periodEnd: endDate,
      status: 'draft'
    });
    
    await report.save();
    
    res.status(201).json({ 
      message: 'Rapor başarıyla oluşturuldu', 
      report 
    });
  } catch (error) {
    console.error('Rapor oluşturma hatası:', error);
    res.status(500).json({ 
      message: 'Rapor oluşturulurken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Get all reports for admin
const getAllReports = async (req, res) => {
  try {
    // Only admins can see all reports
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
    }
    
    // Modified query to only retrieve submitted reports - fixed security issue
    const reports = await Report.find({ status: 'submitted' })
      .populate('team', 'name')
      .populate('teamLeader', 'name surname username')
      .sort({ createdAt: -1 });
      
    res.status(200).json(reports);
  } catch (error) {
    console.error('Rapor getirme hatası:', error);
    res.status(500).json({ 
      message: 'Raporlar alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Get team leader reports
const getTeamLeaderReports = async (req, res) => {
  try {
    // Team leaders can only see their own reports
    if (req.user.role !== 'team_leader' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
    }
    
    const reports = await Report.find({ teamLeader: req.user.id })
      .populate('team', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json(reports);
  } catch (error) {
    console.error('Takım lideri raporları getirme hatası:', error);
    res.status(500).json({ 
      message: 'Raporlar alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Get a single report by ID
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('team', 'name')
      .populate('teamLeader', 'name surname username');
      
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }
    
    // Verify user has permission to view this report
    // Team leaders can see their own reports (draft or submitted)
    // Admin can only see submitted reports - fixed security issue
    if (req.user.role === 'admin' && report.status !== 'submitted') {
      return res.status(403).json({ message: 'Bu rapor henüz gönderilmediği için görüntüleme yetkiniz yok' });
    } else if (req.user.role !== 'admin' && report.teamLeader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu raporu görüntüleme yetkiniz yok' });
    }
    
    res.status(200).json(report);
  } catch (error) {
    console.error('Rapor getirme hatası:', error);
    res.status(500).json({ 
      message: 'Rapor alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Submit report (change status from draft to submitted)
const submitReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('team', 'name')
      .populate('teamLeader', 'name surname');
    
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }
    
    // Verify user has permission to update this report
    if (report.teamLeader._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu raporu güncelleme yetkiniz yok' });
    }
    
    report.status = 'submitted';
    await report.save();
    
    // Send email notification to administrators
    await sendReportSubmissionNotification(report);
    
    res.status(200).json({ 
      message: 'Rapor başarıyla gönderildi', 
      report 
    });
  } catch (error) {
    console.error('Rapor gönderme hatası:', error);
    res.status(500).json({ 
      message: 'Rapor gönderilirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Delete a report
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }
    
    // Verify user has permission to delete this report
    if (req.user.role !== 'admin' && report.teamLeader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu raporu silme yetkiniz yok' });
    }
    
    await Report.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Rapor başarıyla silindi' });
  } catch (error) {
    console.error('Rapor silme hatası:', error);
    res.status(500).json({ 
      message: 'Rapor silinirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Helper function to generate report content
const generateReportContent = async (teamId, startDate, endDate) => {
  try {
    // Get all team members
    const teamMembers = await User.find({ team: teamId, role: 'personel' });
    const teamMemberIds = teamMembers.map(member => member._id);
    
    // Query tasks for this team within date range
    const tasks = await Task.find({
      team: teamId,
      assignedTo: { $in: teamMemberIds },
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('assignedTo', 'name surname');
    
    // Group tasks by status
    const tasksByStatus = {
      todo: tasks.filter(task => task.status === 'todo'),
      inProgress: tasks.filter(task => task.status === 'in-progress'),
      onHold: tasks.filter(task => task.status === 'on-hold'),
      done: tasks.filter(task => task.status === 'done'),
      verified: tasks.filter(task => task.status === 'verified'),
      rejected: tasks.filter(task => task.status === 'rejected')
    };
    
    // Group tasks by team member
    const tasksByMember = {};
    for (const task of tasks) {
      const memberId = task.assignedTo._id.toString();
      if (!tasksByMember[memberId]) {
        tasksByMember[memberId] = {
          name: `${task.assignedTo.name} ${task.assignedTo.surname}`,
          tasks: []
        };
      }
      tasksByMember[memberId].tasks.push(task);
    }
    
    // Use temporary mock report for template generation
    const mockReport = {
      title: 'Görev Raporu',
      team: { name: await Team.findById(teamId).then(team => team.name) },
      teamLeader: { 
        name: 'Takım',
        surname: 'Lideri'
      },
      periodStart: startDate,
      periodEnd: endDate,
      createdAt: new Date(),
      status: 'draft',
      introduction: 'Bu rapor otomatik olarak oluşturulmuştur.'
    };
    
    // Generate content using the template
    return createReportTemplate(mockReport, tasks, tasksByStatus, tasksByMember);
  } catch (error) {
    console.error('Rapor içeriği oluşturma hatası:', error);
    throw error;
  }
};

// Helper function to get status text in Turkish
const getStatusText = (status) => {
  const statusMap = {
    'todo': 'Beklemede',
    'in-progress': 'Devam Ediyor',
    'on-hold': 'Durduruldu',
    'done': 'Tamamlandı',
    'verified': 'Onaylandı',
    'rejected': 'Reddedildi'
  };
  
  return statusMap[status] || status;
};

// Helper function to get status color
const getStatusColor = (status) => {
  const colorMap = {
    'todo': '#3498db', // blue
    'in-progress': '#f39c12', // orange
    'on-hold': '#95a5a6', // gray
    'done': '#2ecc71', // green
    'verified': '#27ae60', // dark green
    'rejected': '#e74c3c' // red
  };
  
  return colorMap[status] || '#333';
};

// Create a report template utility
const createReportTemplate = (report, tasks, tasksByStatus, tasksByMember) => {
  return {
    title: report.title,
    teamName: report.team.name,
    teamLeader: `${report.teamLeader.name} ${report.teamLeader.surname}`,
    period: `${new Date(report.periodStart).toLocaleDateString('tr-TR')} - ${new Date(report.periodEnd).toLocaleDateString('tr-TR')}`,
    createdAt: new Date(report.createdAt).toLocaleDateString('tr-TR'),
    status: 'Gönderilmiş', // Always use "submitted" status for reports
    introduction: report.introduction,
    totalTasks: tasks.length,
    statusCounts: {
      'Bekleyen Görevler': tasksByStatus.todo.length,
      'Devam Eden Görevler': tasksByStatus.inProgress.length,
      'Beklemede Olan Görevler': tasksByStatus.onHold.length,
      'Tamamlanan Görevler': tasksByStatus.done.length,
      'Onaylanan Görevler': tasksByStatus.verified.length,
      'Reddedilen Görevler': tasksByStatus.rejected.length
    },
    personnel: Object.values(tasksByMember).map(member => {
      const memberTasksByStatus = {
        'Bekleyen': member.tasks.filter(task => task.status === 'todo').length,
        'Devam Eden': member.tasks.filter(task => task.status === 'in-progress').length,
        'Beklemede': member.tasks.filter(task => task.status === 'on-hold').length,
        'Tamamlanan': member.tasks.filter(task => task.status === 'done').length,
        'Onaylanan': member.tasks.filter(task => task.status === 'verified').length,
        'Reddedilen': member.tasks.filter(task => task.status === 'rejected').length
      };
      return {
        name: member.name,
        totalTasks: member.tasks.length,
        statusCounts: memberTasksByStatus,
        tasks: member.tasks.map(task => ({
          title: task.title,
          status: getStatusText(task.status),
          description: task.description || 'Açıklama yok'
        }))
      };
    })
  };
};

// Helper function to extract task data from report content
const extractTaskData = (content) => {
  const taskData = {
    totalTasks: 0,
    statusCounts: {
      'Bekleyen Görevler': 0,
      'Devam Eden Görevler': 0,
      'Beklemede Olan Görevler': 0,
      'Tamamlanan Görevler': 0,
      'Onaylanan Görevler': 0,
      'Reddedilen Görevler': 0
    },
    personnel: []
  };
  
  try {
    // Use regex to find and extract data from the content
    
    // Extract total tasks count
    const totalTasksMatch = content.match(/Toplam Görev Say[ıi][sş][ıi]:\s*(\d+)/i);
    if (totalTasksMatch && totalTasksMatch[1]) {
      taskData.totalTasks = parseInt(totalTasksMatch[1], 10);
    }
    
    // Extract status counts
    Object.keys(taskData.statusCounts).forEach(status => {
      const statusRegex = new RegExp(`${status}:\\s*(\\d+)`, 'i');
      const match = content.match(statusRegex);
      if (match && match[1]) {
        taskData.statusCounts[status] = parseInt(match[1], 10);
      }
    });
    
    // Extract personnel data using regex
    const personnelSectionMatch = content.match(/<div class="personnel-distribution">([\s\S]*?)<\/div>/i);
    if (personnelSectionMatch) {
      const personnelSection = personnelSectionMatch[1];
      
      // Extract individual personnel sections
      const personnelRegex = /<div class="personnel-section">([\s\S]*?)<\/div>/g;
      let personnelMatch;
      
      while ((personnelMatch = personnelRegex.exec(personnelSection)) !== null) {
        const personSection = personnelMatch[1];
        
        // Extract person name
        const nameMatch = personSection.match(/<h3>(.*?)<\/h3>/i);
        if (nameMatch) {
          const person = {
            name: nameMatch[1],
            totalTasks: 0,
            statusCounts: {},
            tasks: []
          };
          
          // Extract total tasks
          const totalTasksMatch = personSection.match(/Toplam Görev:\s*(\d+)/i);
          if (totalTasksMatch) {
            person.totalTasks = parseInt(totalTasksMatch[1], 10);
          }
          
          // Extract status counts
          const statusItems = [
            'Bekleyen', 'Devam Eden', 'Beklemede', 
            'Tamamlanan', 'Onaylanan', 'Reddedilen'
          ];
          
          statusItems.forEach(status => {
            const statusRegex = new RegExp(`${status}:\\s*(\\d+)`, 'i');
            const match = personSection.match(statusRegex);
            if (match && match[1]) {
              person.statusCounts[status] = parseInt(match[1], 10);
            }
          });
          
          // Extract tasks
          const taskDetailsMatch = personSection.match(/<div class="task-details">([\s\S]*?)<\/div>/i);
          if (taskDetailsMatch) {
            const taskItems = taskDetailsMatch[1].match(/<li>([\s\S]*?)<\/li>/g);
            if (taskItems) {
              taskItems.forEach(taskItem => {
                const titleMatch = taskItem.match(/<strong>(.*?)<\/strong>/i);
                const statusMatch = taskItem.match(/<span[^>]*>(.*?)<\/span>/i);
                const descriptionMatch = taskItem.match(/<p>(.*?)<\/p>/i);
                
                if (titleMatch) {
                  const task = {
                    title: titleMatch[1],
                    status: statusMatch ? statusMatch[1].trim() : 'Bilinmiyor',
                    description: descriptionMatch ? descriptionMatch[1] : ''
                  };
                  
                  person.tasks.push(task);
                }
              });
            }
          }
          
          taskData.personnel.push(person);
        }
      }
    }
  } catch (error) {
    console.error('Task data extraction error:', error);
  }
  
  return taskData;
};

// Send email notification when a report is submitted
const sendReportSubmissionNotification = async (report) => {
  try {
    // Find all admin users to notify
    const adminUsers = await User.find({ role: 'admin' });
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('No admin users found to notify about the report submission');
      return;
    }
    
    // Create email content
    const subject = `Yeni Rapor Gönderimi: ${report.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #5b3f7a; text-align: center;">Yeni Rapor Gönderimi</h2>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">${report.title}</h3>
          <p><strong>Takım:</strong> ${report.team.name}</p>
          <p><strong>Takım Lideri:</strong> ${report.teamLeader.name} ${report.teamLeader.surname}</p>
          <p><strong>Dönem:</strong> ${new Date(report.periodStart).toLocaleDateString('tr-TR')} - ${new Date(report.periodEnd).toLocaleDateString('tr-TR')}</p>
          <p><strong>Gönderilme Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #5b3f7a;">Takım Lideri Yorumu</h3>
          <p>${report.introduction}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reports" 
             style="background-color: #5b3f7a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Raporu Görüntüle
          </a>
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          <p>Bu e-posta Employee360 Task Manager tarafından otomatik olarak gönderilmiştir.</p>
        </div>
      </div>
    `;
    
    // Send email to each admin
    for (const admin of adminUsers) {
      if (admin.email) {
        await sendEmail({
          to: admin.email,
          subject,
          html
        });
      }
    }
    
    console.log(`📨 Report submission notification sent to ${adminUsers.length} admin(s)`);
  } catch (error) {
    console.error('Failed to send report submission notification:', error);
    // Don't throw error to prevent disrupting the report submission process
  }
};

// Generate text report file - simpler alternative with better encoding support
const generateTextReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('team', 'name')
      .populate('teamLeader', 'name surname');
      
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }
    
    // Verify user has permission
    // Admin can only download submitted reports - fixed security issue
    if (req.user.role === 'admin' && report.status !== 'submitted') {
      return res.status(403).json({ message: 'Bu rapor henüz gönderilmediği için indirme yetkiniz yok' });
    } else if (req.user.role !== 'admin' && report.teamLeader._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu raporu indirme yetkiniz yok' });
    }
    
    // Get all team members without filtering role
    const teamMembers = await User.find({ team: report.team._id });
    const teamMemberIds = teamMembers.map(member => member._id);
    
    // Get all tasks for this team without date filtering to ensure all tasks are included
    const tasks = await Task.find({
      team: report.team._id,
      assignedTo: { $in: teamMemberIds }
    }).populate('assignedTo', 'name surname');
    
    // Group tasks by status
    const tasksByStatus = {
      todo: tasks.filter(task => task.status === 'todo'),
      inProgress: tasks.filter(task => task.status === 'in-progress'),
      onHold: tasks.filter(task => task.status === 'on-hold'),
      done: tasks.filter(task => task.status === 'done'),
      verified: tasks.filter(task => task.status === 'verified'),
      rejected: tasks.filter(task => task.status === 'rejected')
    };
    
    // Group tasks by team member (including all team members even if they have no tasks)
    const tasksByMember = {};
    
    // First initialize with all team members
    teamMembers.forEach(member => {
      tasksByMember[member._id.toString()] = {
        name: `${member.name} ${member.surname}`,
        role: member.role,
        tasks: []
      };
    });
    
    // Then add tasks to each member
    for (const task of tasks) {
      const memberId = task.assignedTo._id.toString();
      if (tasksByMember[memberId]) {
        tasksByMember[memberId].tasks.push(task);
      }
    }
    
    // Get report data
    let reportData;
    try {
      // Try to parse the content as JSON first (for reports created after the fix)
      reportData = JSON.parse(report.content);
    } catch (error) {
      // For older reports that might not have JSON content
      reportData = {
        title: report.title,
        teamName: report.team.name,
        teamLeader: `${report.teamLeader.name} ${report.teamLeader.surname}`,
        period: `${new Date(report.periodStart).toLocaleDateString('tr-TR')} - ${new Date(report.periodEnd).toLocaleDateString('tr-TR')}`,
        createdAt: new Date(report.createdAt).toLocaleDateString('tr-TR'),
        status: report.status,
        introduction: report.introduction,
        totalTasks: tasks.length,
        statusCounts: {
          'Bekleyen Görevler': tasksByStatus.todo.length,
          'Devam Eden Görevler': tasksByStatus.inProgress.length,
          'Beklemede Olan Görevler': tasksByStatus.onHold.length,
          'Tamamlanan Görevler': tasksByStatus.done.length,
          'Onaylanan Görevler': tasksByStatus.verified.length,
          'Reddedilen Görevler': tasksByStatus.rejected.length
        },
        personnel: []
      };
    }
    
    // Generate text content
    let textContent = `============================================\n`;
    textContent += `EMPLOYEE360 TASK MANAGER - GÖREV RAPORU\n`;
    textContent += `============================================\n\n`;
    
    textContent += `${reportData.title}\n`;
    textContent += `============================================\n\n`;
    
    textContent += `Takım: ${reportData.teamName}\n`;
    textContent += `Takım Lideri: ${reportData.teamLeader}\n`;
    textContent += `Dönem: ${reportData.period}\n`;
    textContent += `Oluşturulma Tarihi: ${reportData.createdAt}\n`;
    
    // Only show status if it's been submitted - don't show 'Taslak' status
    if (report.status === 'submitted') {
      textContent += `Rapor Durumu: Gönderilmiş\n`;
    }
    textContent += `\n`;
    
    textContent += `TAKIM LİDERİ YORUMU:\n`;
    textContent += `--------------------------------------------\n`;
    textContent += `${report.introduction || 'Yorum bulunmamaktadır.'}\n\n`;
    
    textContent += `ÖZET BİLGİLER:\n`;
    textContent += `--------------------------------------------\n`;
    textContent += `Toplam Görev Sayısı: ${tasks.length}\n\n`;
    
    textContent += `GÖREV DURUMLARINA GÖRE DAĞILIM:\n`;
    textContent += `• Bekleyen Görevler: ${tasksByStatus.todo.length}\n`;
    textContent += `• Devam Eden Görevler: ${tasksByStatus.inProgress.length}\n`;
    textContent += `• Beklemede Olan Görevler: ${tasksByStatus.onHold.length}\n`;
    textContent += `• Tamamlanan Görevler: ${tasksByStatus.done.length}\n`;
    textContent += `• Onaylanan Görevler: ${tasksByStatus.verified.length}\n`;
    textContent += `• Reddedilen Görevler: ${tasksByStatus.rejected.length}\n`;
    textContent += `\n`;
    
    textContent += `PERSONEL BAZINDA GÖREV DAĞILIMI:\n`;
    textContent += `============================================\n\n`;
    
    // Filter out team leaders and admin users, show only team members
    const teamMembersFiltered = Object.values(tasksByMember).filter(
      member => !member.role || member.role === 'personel'
    );
    
    if (teamMembersFiltered.length > 0) {
      teamMembersFiltered.forEach(person => {
        textContent += `${person.name}\n`;
        textContent += `--------------------------------------------\n`;
        textContent += `Toplam Görev: ${person.tasks.length}\n\n`;
        
        const memberTasksByStatus = {
          'Bekleyen': person.tasks.filter(task => task.status === 'todo').length,
          'Devam Eden': person.tasks.filter(task => task.status === 'in-progress').length,
          'Beklemede': person.tasks.filter(task => task.status === 'on-hold').length,
          'Tamamlanan': person.tasks.filter(task => task.status === 'done').length,
          'Onaylanan': person.tasks.filter(task => task.status === 'verified').length,
          'Reddedilen': person.tasks.filter(task => task.status === 'rejected').length
        };
        
        Object.entries(memberTasksByStatus).forEach(([status, count]) => {
          textContent += `• ${status}: ${count}\n`;
        });
        
        if (person.tasks.length > 0) {
          textContent += `\nGÖREV DETAYLARI:\n`;
          textContent += `--------------------------------------------\n`;
          person.tasks.forEach(task => {
            const statusText = getStatusText(task.status);
            textContent += `• ${task.title} - ${statusText}\n`;
            if (task.description) {
              textContent += `  ${task.description}\n`;
            }
            textContent += `\n`;
          });
        } else {
          textContent += `\nHenüz görev atanmamış.\n\n`;
        }
      });
    } else {
      textContent += `Personel veya görev bilgisi bulunamadı.\n\n`;
    }
    
    textContent += `============================================\n`;
    textContent += `Employee360 Task Manager © ${new Date().getFullYear()}\n`;
    textContent += `============================================\n`;
    
    // Save to file
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    
    // Use a consistent filename with timestamp - remove references to draft/submitted status
    // Replace any non-ASCII characters in the team name with underscores to avoid header encoding issues
    const safeTeamName = report.team.name.replace(/[^\x00-\x7F]/g, '_').replace(/\s+/g, '_');
    const fileName = `rapor_${safeTeamName}_${Date.now()}.txt`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Write file with UTF-8 encoding explicitly set
    fs.writeFile(filePath, textContent, { encoding: 'utf8' }, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Rapor dosyası yazılırken bir hata oluştu', error: err.message });
      }
      
      try {
        // Update report with new file name
        report.fileName = fileName;
        await report.save();
        
        // Use RFC5987 encoding for the filename to handle special characters properly
        const encodedFilename = encodeURIComponent(fileName).replace(/['()]/g, escape);
        
        // Return file as attachment for direct download instead of opening in new tab
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
        res.sendFile(filePath);
      } catch (saveErr) {
        // Still send file even if saving report reference fails
        const encodedFilename = encodeURIComponent(fileName).replace(/['()]/g, escape);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
        res.sendFile(filePath);
      }
    });
  } catch (error) {
    console.error('Metin raporu oluşturma hatası:', error);
    res.status(500).json({ message: 'Metin raporu oluşturulurken bir hata oluştu', error: error.message });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getTeamLeaderReports,
  getReportById,
  submitReport,
  deleteReport,
  generateTextReport
};