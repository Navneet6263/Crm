const axios = require('axios');

// MSG91 Configuration
const SMS_API_KEY = process.env.MSG91_API_KEY || 'YOUR_ACTUAL_MSG91_API_KEY';
const SMS_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
const SMS_API_URL = 'https://control.msg91.com/api/v5/otp/';

const smsService = {
  // Send SMS using MSG91
  sendSMS: async (phoneNumber, message, templateId = null) => {
    try {
      console.log('📱 Sending SMS to:', phoneNumber);
      
      const payload = {
        template_id: templateId || 'default',
        short_url: '1',
        recipients: [
          {
            mobiles: phoneNumber,
            message: message
          }
        ]
      };

      const response = await axios.post(SMS_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'authkey': SMS_API_KEY
        }
      });

      console.log('✅ SMS sent successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  },

  // Send OTP SMS using MSG91 OTP API
  sendOTPSMS: async (phoneNumber, otp) => {
    try {
      console.log('📱 Sending OTP SMS to:', phoneNumber);
      
      const payload = {
        template_id: SMS_TEMPLATE_ID,
        mobile: phoneNumber.replace(/[^0-9]/g, ''), // Clean phone number
        authkey: SMS_API_KEY,
        otp: otp
      };

      const response = await axios.post('https://control.msg91.com/api/v5/otp/', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ OTP SMS sent successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ OTP SMS sending failed:', error.message);
      throw new Error(`OTP SMS sending failed: ${error.message}`);
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
  }
};

module.exports = smsService;