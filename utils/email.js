const nodemailer = require("nodemailer");

module.exports = async function (options) {
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) define the email options
  const mailOptions = {
    from: "Nexpedia Inc. <info@nexpedia.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) actually send the email
  await transporter.sendMail(mailOptions);
};
