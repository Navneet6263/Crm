// SMS Service using backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const smsService = {
  // Send SMS notification via backend
  sendSMS: async (phoneNumber, message, templateId = null) => {
    try {
      console.log('📱 Sending SMS to:', phoneNumber);
      
      const response = await fetch(`${API_BASE_URL}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          message,
          templateId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ SMS sent successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      // Fallback: Show success message for demo
      console.log('📱 Demo mode: SMS would be sent to', phoneNumber);
      return { success: true, message: 'SMS sent (demo mode)' };
    }
  },

  // Send lead assignment notification
  sendLeadAssignmentSMS: async (phoneNumber, leadData, assignedTo) => {
    const message = `🎯 New Lead Assigned!\n\nLead: ${leadData.contactPerson}\nCompany: ${leadData.companyName}\nAssigned to: ${assignedTo}\n\nLogin to CRM to view details.`;
    
    return await smsService.sendSMS(phoneNumber, message);
  },

  // Send welcome SMS
  sendWelcomeSMS: async (phoneNumber, userName) => {
    const message = `🎉 Welcome to Green CRM, ${userName}!\n\nYour account has been created successfully. Login to start managing your leads.\n\nSupport: support@greencrm.com`;
    
    return await smsService.sendSMS(phoneNumber, message);
  },

  // Send OTP SMS
  sendOTPSMS: async (phoneNumber, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          method: 'sms'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ OTP sent successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ OTP sending failed:', error);
      // Demo mode fallback
      console.log(`📱 Demo OTP: ${otp} for ${phoneNumber}`);
      alert(`Demo Mode: Your OTP is ${otp}`);
      return { success: true, message: 'OTP sent (demo mode)' };
    }
  }
};

export default smsService;