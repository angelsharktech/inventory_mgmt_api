// services/notificationService.js
const Notification = require('../models/Notification');
const Work = require('../models/Work');
const User = require('../models/User');

// Create and send a notification
exports.createNotification = async ({ recipient, sender, work, type, message }) => {
  const notification = await Notification.create({
    recipient,
    sender,
    work,
    type,
    message
  });

  // Here you would add real-time notification delivery (Socket.io, push notifications, etc.)
  return notification;
};

// Check for due/overdue works and send notifications
exports.checkDueWorks = async () => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));
  
  // Today's due works
  const todaysDueWorks = await Work.find({
    dueDate: { $gte: todayStart, $lte: todayEnd },
    isResolved: false
  }).populate('admin_id projectManager_id staffAssignments.staff_id client_id');

  for (const work of todaysDueWorks) {
    const recipients = [
      work.admin_id._id,
      work.projectManager_id?._id,
      ...work.staffAssignments.map(a => a.staff_id._id),
      work.client_id._id
    ].filter(id => id);

    for (const recipient of recipients) {
      await this.createNotification({
        recipient,
        work: work._id,
        type: 'DUE_TODAY',
        message: `Work "${work.title}" is due today!`
      });
    }
  }

  // Upcoming due works (next 3 days)
  const upcomingDate = new Date();
  upcomingDate.setDate(upcomingDate.getDate() + 3);
  const upcomingDueWorks = await Work.find({
    dueDate: { $gt: todayEnd, $lte: upcomingDate },
    isResolved: false
  }).populate('admin_id projectManager_id staffAssignments.staff_id client_id');

  for (const work of upcomingDueWorks) {
    const recipients = [
      work.admin_id._id,
      work.projectManager_id?._id,
      ...work.staffAssignments.map(a => a.staff_id._id),
      work.client_id._id
    ].filter(id => id);

    for (const recipient of recipients) {
      await this.createNotification({
        recipient,
        work: work._id,
        type: 'UPCOMING_DUE',
        message: `Work "${work.title}" is due soon (${work.dueDate.toDateString()})`
      });
    }
  }

  // Overdue works
  const overdueWorks = await Work.find({
    dueDate: { $lt: todayStart },
    isResolved: false
  }).populate('admin_id projectManager_id staffAssignments.staff_id client_id');

  for (const work of overdueWorks) {
    const recipients = [
      work.admin_id._id,
      work.projectManager_id?._id,
      ...work.staffAssignments.map(a => a.staff_id._id),
      work.client_id._id
    ].filter(id => id);

    for (const recipient of recipients) {
      await this.createNotification({
        recipient,
        work: work._id,
        type: 'OVERDUE',
        message: `Work "${work.title}" is overdue!`
      });
    }
  }
};

// Schedule the due work checker to run daily
exports.scheduleDueWorkChecks = () => {
  // Run once immediately
  this.checkDueWorks();
  
  // Then run every 24 hours
  setInterval(() => {
    this.checkDueWorks();
  }, 24 * 60 * 60 * 1000);
};