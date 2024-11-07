import mongoose, { Schema } from "mongoose";
import { IUser } from "../../utils/types/SchemaTypes";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (vemail: string) {
          return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            vemail
          );
        },
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone Number is required"],
      trim: true,
      minlength: 9,
      maxlength: 12,
    },
    role: {
      type: String,
      enum: ["admin", "staff", "player", "manager", "umpire"],
      default: "player",
    },
    photo: {
      type: String,
      required: [true, "Photo is required"],
      default: "https://i.ibb.co.com/SVwHczH/m-26.jpg",
    },
    refreshToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: String,
  },
  { timestamps: true }
);

// password encryption
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// validate password
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// method of generate access token
userSchema.methods.generateAccessToken = async function (): Promise<string> {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// method of generate refresh token
userSchema.methods.generateRefreshToken = async function (): Promise<string> {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// method of generate rest password token
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expiration time (e.g., 1 hour)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model<IUser>("User", userSchema);
