import { Model, model, Document } from "mongoose";
import { UserSchema } from "./schema";

export interface IUser extends Document {
  name: string;
  email: string;
  photo?: string;
  role?: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active?: boolean;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

export interface IUserModel extends Model<IUser> {}

export const User: IUserModel = model<IUser, IUserModel>("user", UserSchema);
