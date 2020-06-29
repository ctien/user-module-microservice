import { IUser } from "./model";
import { hash, compare } from "bcryptjs";
import crypto from "crypto";

export async function hashPassword(next: any) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
}

export function createPasswordChangedAt(next: any) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
}

export function findActive(next: any) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
}

export async function correctPassword(
  candidatePassword: string,
  userPassword: string
) {
  return await compare(candidatePassword, userPassword);
}

export function changedPasswordAfter(this: IUser, JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    return JWTTimestamp < this.passwordChangedAt.getTime() / 1000;
  }

  // False means NOT changed
  return false;
}

export function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}
