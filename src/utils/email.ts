import nodemailer, { SendMailOptions } from "nodemailer";
import {
  NODE_ENV,
  EMAIL_FROM,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  SENDGRID_USERNAME,
  SENDGRID_PASSWORD,
} from "../config/env";

interface IOptions {
  to: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: IOptions): Promise<any> => {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions: SendMailOptions = {
    from: "ctien@gmail.com",
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
