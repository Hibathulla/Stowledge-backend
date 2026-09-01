import nodemailer from "nodemailer";

export const sendEmail = async ({
  email,
  subject,
  text,
}: {
  email: string;
  subject: string;
  text: string;
}) => {
  console.log(process.env.MAIL_USERNAME, process.env.MAIL_PASSWORD, process.env.MAIL_HOST, "env");
  //1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  await transporter.verify();

  console.log("reached here");

  //2) Define the email options
  const mailOptions = {
    from: "hibz1211@gmail.com",
    to: email,
    subject,
    text,
  };

  //   console.log(transporter, "transporter");

  //3) Send the mail
  const info = await transporter.sendMail(mailOptions);

  return info;
};
