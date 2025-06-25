import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { 
  getPasswordResetEmailTemplate, 
  getPasswordResetSuccessTemplate,
} from '../templates/email/passwordResetTemplates.js'; //Email templates

dotenv.config();

// Creating email transporter (Gmail)
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_APP_PASSWORD, 
    },
  });
};

// Sending password reset email
export const sendPasswordResetEmail = async (userEmail, username, resetToken) => {
  try {
    console.log(`Sending password reset email to: ${userEmail}`);
    
    // Creating the reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Getting email template
    const emailTemplate = getPasswordResetEmailTemplate(username, resetLink);
    
    // Creating transporter
    const transporter = createEmailTransporter();
    
    // Email options
    const mailOptions = {
      from: {
        name: 'Evangadi Forum',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    // Send email
    const result = transporter.sendMail(mailOptions);
    
    console.log(`Password reset email sent successfully! Message ID: ${result.messageId}`);
    
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    return { success: false, error: error.message };
  }
};

// Sending password reset success email
export const sendPasswordResetSuccessEmail = async (userEmail, username) => {
  try {
    console.log(`Sending success email to: ${userEmail}`);
    
    // Getting email template
    const emailTemplate = getPasswordResetSuccessTemplate(username);
    
    // Create transporter
    const transporter = createEmailTransporter();
    
    // Email options
    const mailOptions = {
      from: {
        name: 'Evangadi Forum',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    // Send email
    const result = transporter.sendMail(mailOptions);
    
    console.log(`✅ Success email sent! Message ID: ${result.messageId}`);

    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending success email:', error.message);
    return { success: false, error: error.message };
  }
};

//Testing email configuration ( to make sure email works)
export const testEmailSetup = async () => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is working!');
    return { success: true };
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return { success: false, error: error.message };
  }
};




// Sending email verification email (for future use)
export const sendEmailVerificationEmail = async (email, username, verificationToken) => {
  try {
    const transporter = createEmailTransporter();
    
    // Create verification link
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    // 🔧 GET: Template from external file
    const emailTemplate = getEmailVerificationTemplate(username, verificationLink);
    
    const mailOptions = {
      from: {
        name: 'Evangadi Forum',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email verification sent:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email verification:', error);
    return { success: false, error: error.message };
  }
};


// Generic email sender (for custom emails)
export const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: {
        name: 'Evangadi Forum',
        address: process.env.EMAIL_USER
      },
      to,
      subject,
      html,
      text,
      attachments
    };

    const result =  transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};


