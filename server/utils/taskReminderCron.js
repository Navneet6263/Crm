const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Task reminder - ONLY in-app notifications, NO emails
const taskReminderCron = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    
    const tasks = await Task.find({
      status: { $in: ['pending', 'in-progress'] },
      dueDate: { $gte: now }
    }).populate('createdBy', 'name email');

    for (const task of tasks) {
      const taskDateTime = new Date(task.dueDate);
      
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
    let assignedUser = null;
    if (task.assignedTo) {
      assignedUser = await User.findOne({ name: task.assignedTo });
    }

    const userId = assignedUser ? assignedUser._id : task.createdBy._id;
    
    // ONLY in-app notification - NO email
    await Notification.create({
      userId: userId,
      type: 'task_reminder',
      title: `Task Reminder: ${timeLeft} left`,
      message: `Your task "${task.title}" is due in ${timeLeft}`,
      relatedTo: 'task',
      relatedId: task._id,
      priority: task.priority === 'urgent' || task.priority === 'high' ? 'high' : 'medium'
    });

    console.log(`✅ In-app notification sent for task: ${task.title} (${timeLeft} left)`);
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
}

module.exports = taskReminderCron;
