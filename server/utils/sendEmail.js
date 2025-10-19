const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter object using the Ethereal credentials
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: '"TeXura Management" <noreply@texura.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  // 3) Actually send the email
  const info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId);
  // Log the URL to preview the sent email in Ethereal
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

// Ensure the last line exports the function directly, without curly braces
module.exports = sendEmail;