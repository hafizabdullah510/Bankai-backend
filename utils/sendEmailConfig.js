import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "hafizabdullah510@gmail.com",
      pass: process.env.SENDER_PASSWORD,
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL, // sender address
    to, // list of receivers
    subject, // Subject line
    html, // html body
  });
};
