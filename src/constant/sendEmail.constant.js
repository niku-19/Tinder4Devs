export const OTP_VERIFICATION_SUBJECT = 'Your Tinder4Devs Verification Code';

export const otpVerificationTemplate = (code) => {
  return `<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; border: 1px solid #e5e7eb; text-align: center; padding: 40px;">
  <h1 style="color: #111827; font-size: 24px;">Tinder4Devs</h1>
  <p style="color: #6b7280;">A verification code has been requested for your account.  
    Please enter the code below to proceed:
    
    <br>
    <br>
    
    If you did not request this, no further action is required.
    </p>
  <div style="background: #eff6ff; padding: 30px; border-radius: 16px; margin: 20px 0;">
    <span style="font-size: 40px; font-weight: 800; color: #2563eb; letter-spacing: 10px;">${code}</span>
  </div>
</div>
</div>`;
};

export const RESET_PASSWORD_SUBJECT = 'Tinder4Devs Password Reset Request';

export const resetPasswordLinkTemplate = (resetLink, code) => {
  return `<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; border: 1px solid #e5e7eb; text-align: center; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <h1 style="color: #111827; font-size: 24px; margin-bottom: 8px;">Tinder4Devs</h1>
  <h2 style="color: #111827; font-size: 20px; font-weight: 600;">Reset your password</h2>
  
  <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin-top: 16px;">
    We received a request to reset the password for your account. 
    Click the button below to set a new password. You’ll then be asked to verify with your OTP.
  </p>

  <div style="padding: 30px 0;">
    <a href="${resetLink}" style="background: #2563eb; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
      Reset Password
    </a>
  </div>

  <div style="background: #eff6ff; padding: 30px; border-radius: 16px; margin: 20px 0;">
    <span style="font-size: 40px; font-weight: 800; color: #2563eb; letter-spacing: 10px;">${code}</span>
    <p style="color: #6b7280; font-size: 14px; margin-top: 12px;">
      Use this code to complete verification. Please note: the OTP will expire in 2 minutes. 
      If it expires, request a new one using the same flow.
    </p>
  </div>

  <div style="border-top: 1px solid #f3f4f6; margin-top: 20px; padding-top: 20px;">
    <p style="color: #9ca3af; font-size: 13px; line-height: 20px;">
      If the button above doesn’t work, copy and paste this link into your browser:
      <br>
      <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
      If you did not request a password reset, you can safely ignore this email. 
      Your password will remain unchanged.
    </p>
  </div>
</div>
`;
};

export const RESET_PASSWORD_SUCCESS_SUBJECT =
  'Your Tinder4Devs Password Has Been Reset';

export const resetPasswordSuccessTemplate = (loginLink) => {
  return `<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; border: 1px solid #e5e7eb; text-align: center; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <h1 style="color: #111827; font-size: 24px; margin-bottom: 8px;">Tinder4Devs</h1>
  <h2 style="color: #111827; font-size: 20px; font-weight: 600;">Password Reset Successful</h2>
  
  <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin-top: 16px;">
    Your password has been reset successfully. You can now use your new password to sign in to your account.
  </p>

  <div style="padding: 30px 0;">
    <a href="${loginLink}" style="background: #2563eb; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
      Sign In
    </a>
  </div>

  <div style="background: #eff6ff; padding: 30px; border-radius: 16px; margin: 20px 0;">
    <p style="color: #2563eb; font-size: 18px; font-weight: 600; margin: 0;">
      Security Note
    </p>
    <p style="color: #6b7280; font-size: 14px; margin-top: 12px;">
      If you did not request this password reset, please update your password immediately and review your account activity.
    </p>
  </div>

  <div style="border-top: 1px solid #f3f4f6; margin-top: 20px; padding-top: 20px;">
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
      Thank you for keeping your account secure.  
      If you have any issues signing in, please request a new password reset using the same flow.
    </p>
  </div>
</div>
`;
};
