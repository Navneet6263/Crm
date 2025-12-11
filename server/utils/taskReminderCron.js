const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Har minute check karo tasks ke liye
const taskReminderCron = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    
    // Pending aur in-progress tasks fetch karo
    const tasks = await Task.find({
      status: { $in: ['pending', 'in-progress'] },
      dueDate: { $gte: now }
    }).populate('createdBy', 'name email');

    for (const task of tasks) {
      const taskDateTime = new Date(task.dueDate);
      
      // Agar time specified hai to use karo
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':');
        taskDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      const timeDiff = taskDateTime - now;
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      // 15 minute reminder
      if (minutesDiff === 15 && !task.notificationsSent.fifteenMin) {
        await sendReminder(task, '15 minutes');
        task.notificationsSent.fifteenMin = true;
        await task.save();
      }

      // 10 minute reminder
      if (minutesDiff === 10 && !task.notificationsSent.tenMin) {
        await sendReminder(task, '10 minutes');
        task.notificationsSent.tenMin = true;
        await task.save();
      }

      // 5 minute reminder
      if (minutesDiff === 5 && !task.notificationsSent.fiveMin) {
        await sendReminder(task, '5 minutes');
        task.notificationsSent.fiveMin = true;
        await task.save();
      }
    }
  } catch (error) {
    console.error('Task reminder cron error:', error);
  }
});

async function sendReminder(task, timeLeft) {
  try {
    // In-app notification create karo
    let assignedUser = null;
    if (task.assignedTo) {
      assignedUser = await User.findOne({ name: task.assignedTo });
    }

    const userId = assignedUser ? assignedUser._id : task.createdBy._id;
    
    await Notification.create({
      userId: userId,
      type: 'task_reminder',
      title: `Task Reminder: ${timeLeft} left`,
      message: `Your task "${task.title}" is due in ${timeLeft}`,
      relatedTo: 'task',
      relatedId: task._id,
      priority: task.priority === 'urgent' || task.priority === 'high' ? 'high' : 'medium'
    });

    // Email notification bhejo agar enabled hai
    if (task.emailNotification && assignedUser && assignedUser.email) {
      const taskDateTime = new Date(task.dueDate);
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':');
        taskDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      await emailService.sendEmail({
        to: assignedUser.email,
        subject: `⏰ Task Reminder: ${timeLeft} left - ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-bottom: 16px;">⏰ Task Reminder</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 12px;">
                <strong>Your task is due in ${timeLeft}!</strong>
              </p>
              <p style="color: #6b7280; margin-bottom: 8px;">
                <strong>Task:</strong> ${task.title}
              </p>
              <p style="color: #6b7280; margin-bottom: 8px;">
                <strong>Description:</strong> ${task.description || 'N/A'}
              </p>
              <p style="color: #6b7280; margin-bottom: 8px;">
                <strong>Due:</strong> ${taskDateTime.toLocaleString()}
              </p>
              <p style="color: #6b7280; margin-bottom: 8px;">
                <strong>Priority:</strong> <span style="color: ${getPriorityColor(task.priority)}; font-weight: bold;">${task.priority.toUpperCase()}</span>
              </p>
            </div>
          </div>
        `
      });
    }

    console.log(`Reminder sent for task: ${task.title} (${timeLeft} left)`);
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'urgent': return '#dc2626';
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
}

module.exports = taskReminderCron;
