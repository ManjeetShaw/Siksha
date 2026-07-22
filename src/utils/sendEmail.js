import fetch from "node-fetch";

async function sendBrevoEmail({ to, subject, htmlContent }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Siksha", email: "dasdivya589@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || "Brevo send failed");
}

export const sendVerificationEmail = async (email, otp) => {
  try {
    await sendBrevoEmail({
      to: email,
      subject: "Verify your Siksha account",
      htmlContent: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#F4F4F4;border-radius:16px;">
          <h2 style="color:#002C43;margin-bottom:8px;">Verify your email</h2>
          <p style="color:#002C43;opacity:0.6;font-size:14px;margin-bottom:24px;">
            Enter this OTP in the app to activate your account. It expires in 10 minutes.
          </p>
          <div style="background:#002C43;color:#F4F4F4;font-size:32px;font-weight:600;letter-spacing:12px;padding:20px;border-radius:12px;text-align:center;">
            ${otp}
          </div>
          <p style="color:#002C43;opacity:0.4;font-size:11px;margin-top:20px;text-align:center;">
            If you didn't create a Siksha account, ignore this email.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Brevo error:", err.message);
    throw err;
  }
};

// Used by /auth/forgot-password (P1-4) — same visual style, different copy
// so a reset OTP can never be mistaken for a signup-verification OTP.
export const sendPasswordResetEmail = async (email, otp) => {
  try {
    await sendBrevoEmail({
      to: email,
      subject: "Reset your Siksha password",
      htmlContent: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#F4F4F4;border-radius:16px;">
          <h2 style="color:#002C43;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#002C43;opacity:0.6;font-size:14px;margin-bottom:24px;">
            Use this code to reset your Siksha password. It expires in 10 minutes. If you didn't request this, you can safely ignore this email — your password won't change.
          </p>
          <div style="background:#002C43;color:#F4F4F4;font-size:32px;font-weight:600;letter-spacing:12px;padding:20px;border-radius:12px;text-align:center;">
            ${otp}
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Brevo error:", err.message);
    throw err;
  }
};