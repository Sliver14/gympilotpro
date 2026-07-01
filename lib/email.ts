import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANT: Change this to your verified domain in Resend (e.g., 'gympilotpro.com')
// If not verified, Resend will return a 400 error.
const SENDING_DOMAIN = 'klimarsspace.com'; 

/**
 * Helper to generate a professional, dynamic "From" address
 */
function getFromAddress(gymName?: string) {
  const name = gymName ? `${gymName} via GymPilotPro` : 'GymPilotPro';
  return `${name} <noreply@${SENDING_DOMAIN}>`;
}

export async function sendSignupEmail(params: {
  email: string;
  firstName: string;
  gymName: string;
  loginUrl: string;
  isNewUser: boolean;
}) {
  const { email, firstName, gymName, loginUrl, isNewUser } = params;
  
  const passwordSection = isNewUser ? `
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">Your Login Credentials</h3>
      <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p><strong>Admin Email:</strong> ${email}</p>
      <p><strong>Default Password:</strong> ChangeMe123!</p>
    </div>
    <p style="color: #ef4444; font-weight: bold;">Please log in immediately and change your default password for security purposes.</p>
  ` : `
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">Dashboard Details</h3>
      <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p><strong>Email:</strong> ${email}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: getFromAddress(gymName),
      to: email,
      subject: `Welcome to GymPilotPro! (${gymName})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Welcome to GymPilotPro</h2>
          <p>Hi ${firstName},</p>
          <p>Your account for <strong>${gymName}</strong> is now live.</p>
          
          ${passwordSection}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to My Dashboard
            </a>
          </div>
        </div>
      `,
    });
    console.log(`Signup email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send signup email:', err);
  }
}

export async function sendRenewalEmail(params: {
  email: string;
  gymName: string;
  amount: number;
  nextBillingDate: string;
  dashboardUrl: string;
}) {
  const { email, gymName, amount, nextBillingDate, dashboardUrl } = params;
  
  try {
    await resend.emails.send({
      from: getFromAddress(gymName),
      to: email,
      subject: "Subscription Renewed Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Subscription Renewed Successfully</h2>
          <p>Hi,</p>
          <p>Your subscription for <strong>${gymName}</strong> has been successfully renewed.</p>
          <ul>
            <li><strong>Amount Paid:</strong> ₦${amount}</li>
            <li><strong>Next Billing Date:</strong> ${nextBillingDate}</li>
          </ul>
          <p>
            <a href="${dashboardUrl}" style="color: #f97316; font-weight: bold;">Go to Dashboard</a>
          </p>
        </div>
      `,
    });
    console.log(`Renewal email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send renewal email:', err);
  }
}

export async function sendUpgradeEmail(params: {
  email: string;
  gymName: string;
  planName: string;
  dashboardUrl: string;
}) {
  const { email, gymName, planName, dashboardUrl } = params;
  
  try {
    await resend.emails.send({
      from: getFromAddress(gymName),
      to: email,
      subject: "Your Plan Has Been Upgraded",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Plan Upgraded Successfully</h2>
          <p>Hi,</p>
          <p>Your GymPilotPro plan for <strong>${gymName}</strong> has been upgraded to <strong>${planName}</strong>.</p>
          <p>Enjoy your new limits and features!</p>
          <p>
            <a href="${dashboardUrl}" style="color: #f97316; font-weight: bold;">Go to Dashboard</a>
          </p>
        </div>
      `,
    });
    console.log(`Upgrade email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send upgrade email:', err);
  }
}

export async function sendWelcomeEmail(params: {
  email: string;
  firstName: string;
  role: string;
  gymName: string;
  loginUrl: string;
  password?: string;
}) {
  const { email, firstName, role, gymName, loginUrl, password } = params;
  
  const passwordSection = password ? `
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">Your Login Credentials</h3>
      <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Default Password:</strong> ${password}</p>
    </div>
    <p style="color: #ef4444; font-weight: bold;">Please log in immediately and change your default password for security purposes.</p>
  ` : `
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">Account Details</h3>
      <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p><strong>Email:</strong> ${email}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: getFromAddress(gymName),
      to: email,
      subject: `Welcome to ${gymName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Welcome to the Team!</h2>
          <p>Hi ${firstName},</p>
          <p>Your account as a <strong>${role.toUpperCase()}</strong> at <strong>${gymName}</strong> is now active.</p>
          
          ${passwordSection}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 40px; text-align: center;">
            Sent via GymPilotPro Sanctuary
          </p>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send welcome email:', err);
  }
}

export async function sendMemberWelcomeEmail(params: {
  email: string;
  firstName: string;
  gymName: string;
  loginUrl: string;
  password?: string;
}) {
  const { email, firstName, gymName, loginUrl, password } = params;
  
  const passwordSection = password ? `
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">Your Login Credentials</h3>
      <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Default Password:</strong> ${password}</p>
    </div>
    <p style="color: #ef4444; font-weight: bold;">Please change this password after your first login for security.</p>
  ` : `
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">Account Details</h3>
      <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p><strong>Email:</strong> ${email}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: getFromAddress(gymName),
      to: email,
      subject: `Your Membership at ${gymName} is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Welcome to ${gymName}</h2>
          <p>Hi ${firstName},</p>
          <p>We are excited to have you join us! Your membership account is now ready.</p>
          
          ${passwordSection}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Access Member Dashboard
            </a>
          </div>

          <p>If you have any questions, feel free to reach out to the gym management.</p>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 40px; text-align: center;">
            Sent via GymPilotPro Sanctuary
          </p>
        </div>
      `,
    });
    console.log(`Member welcome email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send member welcome email:', err);
  }
}

export async function sendMemberPaymentEmail(params: {
  memberEmail: string;
  adminEmail: string;
  memberName: string;
  gymName: string;
  amount: number;
  expiryDate: string;
  datePaid: string;
}) {
  const { memberEmail, adminEmail, memberName, gymName, amount, expiryDate, datePaid } = params;
  
  try {
    // Send to member
    if (memberEmail) {
      await resend.emails.send({
        from: getFromAddress(gymName),
        to: memberEmail,
        subject: "Membership Renewed Successfully",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">Membership Renewed Successfully</h2>
            <p>Hi ${memberName},</p>
            <p>Your membership at <strong>${gymName}</strong> has been successfully renewed.</p>
            <ul>
              <li><strong>Amount Paid:</strong> ₦${amount}</li>
              <li><strong>New Expiry Date:</strong> ${expiryDate}</li>
            </ul>
          </div>
        `,
      });
      console.log(`Member renewal email sent to ${memberEmail}`);
    }

    // Send to admin
    if (adminEmail) {
      await resend.emails.send({
        from: getFromAddress(gymName),
        to: adminEmail,
        subject: "Member Payment Received",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">Member Payment Received</h2>
            <p>A new payment has been received for <strong>${gymName}</strong>.</p>
            <ul>
              <li><strong>Member Name:</strong> ${memberName}</li>
              <li><strong>Amount:</strong> ₦${amount}</li>
              <li><strong>Date Paid:</strong> ${datePaid}</li>
            </ul>
          </div>
        `,
      });
      console.log(`Admin member payment notification sent to ${adminEmail}`);
    }
  } catch (err) {
    console.error('Failed to send member payment emails:', err);
  }
}

// ---------------------------------------------------------------------------
// CRON JOB AUTOMATED REMINDER EMAILS
// ---------------------------------------------------------------------------

export function getGymMemberReminderEmailContent(params: {
  email: string;
  firstName: string;
  gymName: string;
  daysRemaining: number;
  expiryDate: string;
  renewalUrl: string;
}) {
  const { email, firstName, gymName, daysRemaining, expiryDate, renewalUrl } = params;
  
  let subject = '';
  let heading = '';
  let message = '';
  let color = '#f97316'; // Orange for warnings

  if (daysRemaining === 0) {
    subject = `Action Required: Your membership at ${gymName} has expired`;
    heading = 'Membership Expired';
    message = `Your gym access expired today (${expiryDate}). Please renew your membership to regain access to the terminal and continue your fitness journey.`;
    color = '#ef4444'; // Red for expired
  } else if (daysRemaining === 1) {
    subject = `Last Day! Your ${gymName} membership expires tomorrow`;
    heading = 'Expires Tomorrow';
    message = `This is a friendly reminder that your gym membership will expire tomorrow (${expiryDate}). Renew today to avoid any interruption in your access.`;
  } else {
    subject = `Reminder: Your ${gymName} membership expires in ${daysRemaining} days`;
    heading = 'Expiring Soon';
    message = `Your gym access will expire on ${expiryDate} (${daysRemaining} days remaining). Extend your plan now to maintain uninterrupted access.`;
  }

  return {
    from: getFromAddress(gymName),
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: ${color}; margin-top: 0;">${heading}</h2>
        <p>Hi ${firstName},</p>
        <p>${message}</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${renewalUrl}" style="background-color: ${color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Renew Membership Now
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          Sent automatically by GymPilotPro on behalf of ${gymName}
        </p>
      </div>
    `,
  };
}

export async function sendGymMemberReminderEmail(params: {
  email: string;
  firstName: string;
  gymName: string;
  daysRemaining: number;
  expiryDate: string;
  renewalUrl: string;
}) {
  try {
    const content = getGymMemberReminderEmailContent(params);
    await resend.emails.send(content);
    console.log(`Sent ${params.daysRemaining}-day reminder to gym member ${params.email}`);
  } catch (err) {
    console.error(`Failed to send gym member reminder to ${params.email}:`, err);
  }
}

export function getSaaSReminderEmailContent(params: {
  email: string;
  gymName: string;
  daysRemaining: number;
  expiryDate: string;
  billingUrl: string;
}) {
  const { email, gymName, daysRemaining, expiryDate, billingUrl } = params;
  
  let subject = '';
  let heading = '';
  let message = '';
  let color = '#f97316';

  if (daysRemaining === 0) {
    subject = `URGENT: GymPilotPro Subscription Expired for ${gymName}`;
    heading = 'Subscription Expired';
    message = `Your GymPilotPro SaaS subscription has expired as of today (${expiryDate}). Your gym's online services and member terminals may be restricted. Please update your billing immediately to restore full service.`;
    color = '#ef4444';
  } else {
    subject = `Action Required: GymPilotPro plan for ${gymName} renews in ${daysRemaining} days`;
    heading = 'Subscription Renewing Soon';
    message = `Your GymPilotPro plan for ${gymName} is set to renew or expire on ${expiryDate} (${daysRemaining} days remaining). Please ensure your billing information is up to date to avoid any service interruptions.`;
  }

  return {
    from: getFromAddress('GymPilotPro'),
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: ${color}; margin-top: 0;">${heading}</h2>
        <p>Hello,</p>
        <p>${message}</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${billingUrl}" style="background-color: ${color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Manage Billing & Subscription
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          GymPilotPro Administration
        </p>
      </div>
    `,
  };
}

export async function sendSaaSReminderEmail(params: {
  email: string;
  gymName: string;
  daysRemaining: number;
  expiryDate: string;
  billingUrl: string;
}) {
  try {
    const content = getSaaSReminderEmailContent(params);
    await resend.emails.send(content);
    console.log(`Sent ${params.daysRemaining}-day SaaS reminder to gym owner ${params.email}`);
  } catch (err) {
    console.error(`Failed to send SaaS reminder to ${params.email}:`, err);
  }
}

export async function sendPasswordResetEmail(params: {
  email: string;
  firstName: string;
  gymName: string;
  resetLink: string;
}) {
  const { email, firstName, gymName, resetLink } = params;
  
  try {
    await resend.emails.send({
      from: getFromAddress(gymName),
      to: email,
      subject: `Reset Your ${gymName} Password`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Password Reset Request</h2>
          <p>Hello ${firstName || 'Member'},</p>
          <p>We received a request to reset your password for your ${gymName} account.</p>
          <p>Click the button below to set a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour for security reasons.<br>
            If you did not request a password reset, please ignore this email or contact support immediately.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">
            ${gymName}
          </p>
        </div>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send password reset email:', err);
  }
}

export async function sendGymRegistrationTrialEmail(params: {
  email: string;
  firstName: string;
  gymName: string;
  loginUrl: string;
}) {
  const { email, firstName, gymName, loginUrl } = params;
  
  try {
    await resend.emails.send({
      from: getFromAddress('GymPilotPro'),
      to: email,
      subject: `Welcome to GymPilotPro, ${firstName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f97316;">Welcome to GymPilotPro!</h2>
          <p>Hi ${firstName},</p>
          <p>Your account for <strong>${gymName}</strong> has been successfully created!</p>
          <p>Please log in to your dashboard to complete your setup by making the payment, so you can start protecting your revenue today.</p>
          <p><strong>Dashboard Login:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
          <p>Your temporary password is: <code>ChangeMe123!</code> (Please change this after your first login).</p>
          <br/>
          <p>Best regards,<br/>The GymPilotPro Team</p>
        </div>
      `,
    });
    console.log(`Gym registration email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send gym registration email:', err);
  }
}

export async function sendBatchEmails(emails: {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
}[]) {
  if (emails.length === 0) return;

  try {
    // Resend batch limit is 100
    const chunks = [];
    for (let i = 0; i < emails.length; i += 100) {
      chunks.push(emails.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      await resend.batch.send(chunk.map(email => ({
        from: email.from || getFromAddress(),
        ...email
      })));
    }
    console.log(`Successfully sent batch of ${emails.length} emails`);
  } catch (err) {
    console.error('Failed to send batch emails:', err);
    throw err;
  }
}


