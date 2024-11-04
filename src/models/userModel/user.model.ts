import mongoose,{Document, Schema} from "mongoose"

interface IUser extends Document{
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    role: "admin" | "staff" | "player" | "manager" | "umpire",
    photo: string,
    refreshToken?: string,
    resetPasswordToken?: string,
    resetPasswordExpire?: Date,
    // methods
    isPasswordCorrect(password: string): Promise<boolean>,
    generateAccessToken(): Promise<string>,
    generateRefreshToken(): Promise<string>,
    generateResetPasswordToken(): Promise<string>
};

const userSchema: Schema<IUser> = new Schema(
    {
        name: {
            type: String,
            required: [true, "name is required"]
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
            required: [true, "Password is required"]
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone Number is required"],
            trim: true,
            minlength: 9,
            maxlength: 12
        },
        role: {
            type: String,
            enum: ["admin", "staff", "player", "manager", "umpire"],
            default: "player"
        },
        photo: {
            type: String,
            required: [true, "Photo is required"]
        },
        refreshToken: String,
        resetPasswordToken: String,
        resetPasswordExpire: String
    },
    {timestamps: true}
)

export const User = mongoose.model<IUser>("User", userSchema)