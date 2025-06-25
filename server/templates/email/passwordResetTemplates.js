// Password Reset Email Template
export const getPasswordResetEmailTemplate = (username, resetLink) => {
  const subject = "Reset Your Evangadi Forum Password";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Evangadi Forum</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background-color: #f9f9f9;
                padding: 30px;
                border-radius: 10px;
                border: 1px solid #ddd;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                color: #FF8500;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .reset-button {
                display: inline-block;
                background-color: #FF8500;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .reset-button:hover {
                background-color: #e6750a;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                font-size: 12px;
                color: #666;
                text-align: center;
                margin-top: 30px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Evangadi Forum</div>
                <h2>Password Reset Request</h2>
            </div>
            
            <div class="content">
                <p>Hello <strong>${username}</strong>,</p>
                
                <p>We received a request to reset your password for your Evangadi Forum account. If you made this request, click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetLink}" class="reset-button">Reset My Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
                    ${resetLink}
                </p>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>This link will expire in 1 hour for security reasons</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password will remain unchanged if you don't click the link</li>
                    </ul>
                </div>
                
                <p>If you're having trouble with the button above, you can also reset your password by visiting our website and using the "Forgot Password" feature.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Evangadi Forum</p>
                <p>Need help? Contact our support team</p>
                <p>© ${new Date().getFullYear()} Evangadi Forum. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  const text = `
    Hello ${username},
    
    We received a request to reset your password for your Evangadi Forum account.
    
    To reset your password, please visit the following link:
    ${resetLink}
    
    This link will expire in 1 hour for security reasons.
    
    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
    
    Best regards,
    Evangadi Forum Team
  `;
  
  return { subject, html, text };
};

// Password Reset Success Email Template
export const getPasswordResetSuccessTemplate = (username) => {
  const subject = "Password Successfully Reset - Evangadi Forum";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Success - Evangadi Forum</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background-color: #f9f9f9;
                padding: 30px;
                border-radius: 10px;
                border: 1px solid #ddd;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                color: #FF8500;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .success-icon {
                font-size: 48px;
                color: #28a745;
                margin: 20px 0;
            }
            .content {
                margin-bottom: 30px;
            }
            .security-tips {
                background-color: #e8f5e8;
                border: 1px solid #c3e6c3;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                font-size: 12px;
                color: #666;
                text-align: center;
                margin-top: 30px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Evangadi Forum</div>
                <div class="success-icon">✅</div>
                <h2>Password Successfully Reset</h2>
            </div>
            
            <div class="content">
                <p>Hello <strong>${username}</strong>,</p>
                
                <p>Great news! Your password has been successfully reset for your Evangadi Forum account.</p>
                
                <p>You can now log in to your account using your new password.</p>
                
                <div class="security-tips">
                    <strong>🔒 Security Tips:</strong>
                    <ul>
                        <li>Keep your password secure and don't share it with anyone</li>
                        <li>Use a unique password that you don't use on other websites</li>
                        <li>Consider using a password manager</li>
                        <li>Log out of your account when using shared computers</li>
                    </ul>
                </div>
                
                <p>If you did not reset your password, please contact our support team immediately, as this could indicate unauthorized access to your account.</p>
                
                <p>Thank you for being part of the Evangadi Forum community!</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Evangadi Forum</p>
                <p>Need help? Contact our support team</p>
                <p>© ${new Date().getFullYear()} Evangadi Forum. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  const text = `
    Hello ${username},
    
    Your password has been successfully reset for your Evangadi Forum account.
    
    You can now log in using your new password.
    
    Security Tips:
    - Keep your password secure and don't share it with anyone
    - Use a unique password that you don't use on other websites
    - Consider using a password manager
    - Log out when using shared computers
    
    If you did not reset your password, please contact our support team immediately.
    
    Thank you for being part of the Evangadi Forum community!
    
    Best regards,
    Evangadi Forum Team
  `;
  
  return { subject, html, text };
};

// Email Verification Template
export const getEmailVerificationTemplate = (username, verificationLink) => {
  const subject = "Verify Your Email - Evangadi Forum";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - Evangadi Forum</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background-color: #f9f9f9;
                padding: 30px;
                border-radius: 10px;
                border: 1px solid #ddd;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                color: #FF8500;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .verify-button {
                display: inline-block;
                background-color: #FF8500;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .verify-button:hover {
                background-color: #e6750a;
            }
            .info-box {
                background-color: #e8f4fd;
                border: 1px solid #b8daff;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                font-size: 12px;
                color: #666;
                text-align: center;
                margin-top: 30px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Evangadi Forum</div>
                <h2>Welcome to Evangadi Forum!</h2>
            </div>
            
            <div class="content">
                <p>Hello <strong>${username}</strong>,</p>
                
                <p>Welcome to Evangadi Forum! We're excited to have you join our community of learners and developers.</p>
                
                <p>To complete your registration and start participating in discussions, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${verificationLink}" class="verify-button">Verify My Email</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
                    ${verificationLink}
                </p>
                
                <div class="info-box">
                    <strong>ℹ️ What happens after verification:</strong>
                    <ul>
                        <li>You'll be able to ask questions and get answers</li>
                        <li>You can help other community members</li>
                        <li>You'll receive notifications about your posts</li>
                        <li>You can participate in community discussions</li>
                    </ul>
                </div>
                
                <p>If you didn't create an account with us, you can safely ignore this email.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Evangadi Forum</p>
                <p>Need help? Contact our support team</p>
                <p>© ${new Date().getFullYear()} Evangadi Forum. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  const text = `
    Hello ${username},
    
    Welcome to Evangadi Forum! We're excited to have you join our community.
    
    To complete your registration, please verify your email address by visiting:
    ${verificationLink}
    
    After verification, you'll be able to:
    - Ask questions and get answers
    - Help other community members
    - Receive notifications about your posts
    - Participate in community discussions
    
    If you didn't create an account with us, you can safely ignore this email.
    
    Welcome to the community!
    
    Best regards,
    Evangadi Forum Team
  `;
  
  return { subject, html, text };
};