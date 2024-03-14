import { sendEmail } from "./sendEmailConfig.js";
export const sendResetPasswordEmail = async ({ email, token, origin }) => {
  const resetUrl = `${origin}/reset_password?token=${token}&email=${email}`;

  const message = `<p>Please click on the link to reset password : <a href="${resetUrl}">Reset Password</a></p>`;

  const Subject = "Reset Password";

  return sendEmail({
    to: email,
    subject: Subject,
    html: `<h4>Hello </h4>${message}`,
  });
};
