const Notification = require('../models/Notification');

const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      metadata
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const notifyTicketCreated = async (ticket) => {
  try {
    // Notify customer
    await createNotification(
      ticket.customerId,
      'ticket_created',
      'Support Ticket Created',
      `Your ticket #${ticket.ticketId} has been created successfully.`,
      { ticketId: ticket._id, ticketNumber: ticket.ticketId }
    );

    // Notify admins (you can implement admin notification logic here)
    console.log(`New ticket created: ${ticket.ticketId}`);
  } catch (error) {
    console.error('Error in notifyTicketCreated:', error);
  }
};

const notifyTicketReply = async (ticket, reply, isFromAdmin = false) => {
  try {
    const targetUserId = isFromAdmin ? ticket.customerId : null;
    
    if (targetUserId) {
      await createNotification(
        targetUserId,
        'ticket_reply',
        'New Reply on Your Ticket',
        `You have received a new reply on ticket #${ticket.ticketId}`,
        { 
          ticketId: ticket._id, 
          ticketNumber: ticket.ticketId,
          replyId: reply._id
        }
      );
    }
  } catch (error) {
    console.error('Error in notifyTicketReply:', error);
  }
};

const notifyTicketResolved = async (ticket) => {
  try {
    await createNotification(
      ticket.customerId,
      'ticket_resolved',
      'Ticket Resolved',
      `Your ticket #${ticket.ticketId} has been resolved. You can now delete it if you wish.`,
      { ticketId: ticket._id, ticketNumber: ticket.ticketId }
    );
  } catch (error) {
    console.error('Error in notifyTicketResolved:', error);
  }
};

module.exports = {
  createNotification,
  notifyTicketCreated,
  notifyTicketReply,
  notifyTicketResolved
};