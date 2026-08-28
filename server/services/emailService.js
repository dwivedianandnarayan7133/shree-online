const nodemailer = require('nodemailer');

const OWNER_INFO = {
  name: 'Krishan Narayan Dwivedi',
  role: 'Founder & Managing Owner',
  phone: '9161400719',
  email: 'onlinebaba111111@gmail.com'
};

const ADMIN_INFO = {
  name: 'Kamal Narayan Dwivedi',
  role: 'Managing Director & Main Controller',
  phone: '8090794210',
  email: 'kdshree778@gmail.com'
};

// Create Google / Gmail Transporter
function createTransporter() {
  const user = process.env.EMAIL_USER || process.env.GMAIL_USER || 'dwivedianandnarayan@gmail.com';
  const pass = (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD || '').replace(/\s+/g, '');

  if (pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: user,
      pass: pass || 'demo-app-password'
    }
  });
}

/**
 * 1. Send 6-Digit Registration OTP to Gmail
 */
async function sendRegisterOtpEmail(toEmail, otp, userName = 'Citizen') {
  try {
    const transporter = createTransporter();
    const fromUser = process.env.EMAIL_USER || process.env.GMAIL_USER || 'dwivedianandnarayan@gmail.com';
    const mailOptions = {
      from: `"Shree Online Verification" <${fromUser}>`,
      to: toEmail,
      subject: `Your Shree Online Registration OTP: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 24px; color: #1e293b;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #10b981, #0f172a); color: #ffffff; padding: 22px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; letter-spacing: -0.5px;">SHREE ONLINE</h2>
              <p style="margin: 3px 0 0 0; color: #a7f3d0; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                Mahuli, Sant Kabir Nagar • Account Verification
              </p>
            </div>

            <div style="padding: 24px; text-align: center;">
              <p style="font-size: 14px; color: #334155; margin-top: 0;">Namaste <b>${userName}</b>,</p>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Please use the following 6-digit One-Time Password (OTP) to complete your registration for <b>Shree Online Sewa Kendra</b>:
              </p>

              <div style="background: #ecfdf5; border: 2px dashed #10b981; border-radius: 8px; padding: 14px; margin: 18px 0; display: inline-block;">
                <span style="font-size: 30px; font-weight: 900; letter-spacing: 6px; color: #059669; font-family: monospace;">${otp}</span>
              </div>

              <p style="font-size: 12px; color: #e11d48; font-weight: bold; margin: 0;">
                ⚠️ This OTP is valid for 10 minutes. Please do not share it with anyone.
              </p>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 20px; font-size: 11px; color: #64748b; text-align: left;">
                <div>📍 <b>Center</b>: Shree Online Sewa Kendra (Est. 2013), Main Market, Mahuli, S.K.N</div>
                <div>🛡️ <b>Admin MD</b>: Kamal Narayan Dwivedi (+91 ${ADMIN_INFO.phone})</div>
                <div>👑 <b>Owner</b>: Krishan Narayan Dwivedi (+91 ${OWNER_INFO.phone})</div>
              </div>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Google Mail] Registration OTP sent to ${toEmail} (ID: ${info.messageId || 'sent'})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[Google Mail Notice] Registration OTP simulation for ${toEmail}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * 2. Send Login Alert / Security Notification to Gmail on Each Login
 */
async function sendLoginAlertEmail(toEmail, userName, role, ipAddress = '127.0.0.1', loginTime = new Date()) {
  try {
    const transporter = createTransporter();
    const fromUser = process.env.EMAIL_USER || process.env.GMAIL_USER || 'dwivedianandnarayan@gmail.com';
    const formattedTime = new Date(loginTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const mailOptions = {
      from: `"Shree Online Security" <${fromUser}>`,
      to: toEmail,
      subject: `Security Alert: Successful Login to Shree Online Portal`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <div style="background: #1e293b; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">SHREE ONLINE</h2>
              <p style="margin: 2px 0 0 0; color: #38bdf8; font-size: 12px; font-weight: bold;">Security & Access Notification</p>
            </div>

            <div style="padding: 24px;">
              <p style="font-size: 14px; color: #334155; margin-top: 0;">Hello <b>${userName}</b>,</p>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Your account was just logged in to <b>Shree Online Sewa Kendra (Mahuli, S.K.N)</b>.
              </p>

              <div style="background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 12px; color: #334155;">
                <div style="margin-bottom: 4px;">👤 <b>Account Role</b>: ${role ? role.toUpperCase() : 'CUSTOMER'}</div>
                <div style="margin-bottom: 4px;">🕒 <b>Login Timestamp</b>: ${formattedTime} (IST)</div>
                <div>🌐 <b>IP / Client</b>: ${ipAddress}</div>
              </div>

              <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
                If this was you, no action is needed. If you did not recognize this login, please contact the center admin immediately at <a href="tel:+918090794210" style="color: #2563eb; font-weight: bold;">+91 8090794210</a>.
              </p>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
                © 2013 – 2026 Shree Online Sewa Kendra • Mahuli, Sant Kabir Nagar (S.K.N), U.P.
              </div>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Google Mail] Login alert sent to ${toEmail} (ID: ${info.messageId || 'sent'})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[Google Mail Notice] Login alert simulation for ${toEmail}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Send Welcome Email upon Registration
 */
async function sendWelcomeEmail(toEmail, userName = 'Valued Customer') {
  try {
    const transporter = createTransporter();
    const fromUser = process.env.EMAIL_USER || process.env.GMAIL_USER || 'dwivedianandnarayan@gmail.com';
    const mailOptions = {
      from: `"Shree Online (Mahuli, S.K.N)" <${fromUser}>`,
      to: toEmail,
      subject: `Welcome to Shree Online Sewa Kendra (Est. 2013) - Mahuli, S.K.N`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">SHREE ONLINE</h1>
              <p style="margin: 4px 0 0 0; color: #38bdf8; font-size: 13px; font-weight: bold; text-transform: uppercase;">
                Digital Seva & CSC Kendra • Established in 2013
              </p>
              <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 12px;">
                Main Market, Mahuli, Sant Kabir Nagar (S.K.N), U.P.
              </p>
            </div>

            <!-- Body -->
            <div style="padding: 28px 24px;">
              <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome, ${userName}!</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for joining <b>Shree Online Sewa Kendra</b>. Since <b>2013</b>, we have been Mahuli's most trusted digital service center, providing reliable online government applications, student exam services, instant A4 passport photo printing, and universal document restoration.
              </p>

              <!-- Services Highlights -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <div style="font-weight: bold; font-size: 14px; color: #0f172a; margin-bottom: 8px;">🌟 Popular Digital Services:</div>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
                  <li><b>Govt Job & Exam Forms</b>: UP Police, SSC, Railway, UPSSSC PET, UPPSC, Teaching</li>
                  <li><b>A4 Passport Photo Studio</b>: Official Exam Sky-Blue Background (6 photos/line)</li>
                  <li><b>Universal Doc Restore & OCR</b>: Convert Scans to Word (.docx) & Excel (.xlsx)</li>
                  <li><b>PAN & Aadhaar Services</b>: Instant e-PAN, corrections & updates</li>
                  <li><b>e-District Uttar Pradesh</b>: Income, Caste, Domicile certificates</li>
                </ul>
              </div>

              <!-- Leadership Contacts -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px;">
                <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">Direct Support & Leadership Desks:</div>
                <div style="font-size: 12px; color: #475569; line-height: 1.6;">
                  <div>🛡️ <b>Admin MD</b>: ${ADMIN_INFO.name} • 📞 <a href="tel:${ADMIN_INFO.phone}" style="color: #2563eb;">+91 ${ADMIN_INFO.phone}</a> • ✉️ <a href="mailto:${ADMIN_INFO.email}" style="color: #2563eb;">${ADMIN_INFO.email}</a></div>
                  <div>👑 <b>Owner</b>: ${OWNER_INFO.name} • 📞 <a href="tel:${OWNER_INFO.phone}" style="color: #2563eb;">+91 ${OWNER_INFO.phone}</a> • ✉️ <a href="mailto:${OWNER_INFO.email}" style="color: #2563eb;">${OWNER_INFO.email}</a></div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <div>© 2013 – 2026 Shree Online Sewa Kendra • Mahuli, Sant Kabir Nagar (S.K.N), U.P.</div>
              <div style="margin-top: 4px; font-style: italic;">“One Window. Every Digital Service.”</div>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Google Mail] Welcome email dispatched to ${toEmail} (ID: ${info.messageId || 'sent'})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[Google Mail Notice] Welcome email simulation for ${toEmail}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendRegisterOtpEmail,
  sendLoginAlertEmail,
  sendWelcomeEmail,
  OWNER_INFO,
  ADMIN_INFO
};
