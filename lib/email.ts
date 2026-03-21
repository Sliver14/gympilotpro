import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = 'GymPilotPro <noreply@klimarsspace.com>';

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
      from: fromEmail,
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
      from: fromEmail,
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
      from: fromEmail,
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
      from: fromEmail,
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
      from: fromEmail,
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
        from: fromEmail,
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
        from: fromEmail,
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
