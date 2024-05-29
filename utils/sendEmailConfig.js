import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "arnulfo.ledner6@ethereal.email",
      pass: "xJYyX46mvbSZeg9yku",
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Abdullah Coder" <abdullahCoding@gmail.com>', // sender address
    to, // list of receivers
    subject, // Subject line
    html, // html body
  });
};
