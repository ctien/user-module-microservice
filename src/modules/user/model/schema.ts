import { Schema, SchemaDefinition } from "mongoose";
import validator from "validator";
import {
  hashPassword,
  changedPasswordAfter,
  createPasswordChangedAt,
  correctPassword,
  createPasswordResetToken,
  findActive,
} from "./helpers";

// The mongoose user schema definition.
const definition: SchemaDefinition = {
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el: string) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
};

// Create the user schema using the user schema definition and add hooks and methods.
export const UserSchema = new Schema(definition)
  .pre("save", hashPassword)
  .pre("save", createPasswordChangedAt)
  .pre(/^find/, findActive)
  .method("correctPassword", correctPassword)
  .method("changedPasswordAfter", changedPasswordAfter)
  .method("createPasswordResetToken", createPasswordResetToken);
