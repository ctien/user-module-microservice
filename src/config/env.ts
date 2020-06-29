import * as dotenv from "dotenv";

dotenv.config();

export const MONGO_URL = process.env.MONGO_URL;
export const PORT = process.env.PORT;
export const JWT_SECRET = "secret";
export const JWT_EXPIRES_IN = "1h";
export const JWT_COOKIE_EXPIRES_IN: any = "";
export const NODE_ENV: string = "";
export const EMAIL_FROM: string = "";
export const EMAIL_HOST: string = "";
export const EMAIL_PORT: number = 0;
export const EMAIL_USERNAME: string = "";
export const EMAIL_PASSWORD: string = "";
export const SENDGRID_USERNAME: string = "";
export const SENDGRID_PASSWORD: string = "";
