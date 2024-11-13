import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import crypto from "crypto";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendEmail } from "../../utils/nodemailer.utils";

export const forgetPassword = asyncHandler(async(req, res)=>{
    // get email
    const {email} = req.body;
    if(!email){
        throw new ApiError(400, "email is required for forget password");
    };

    // check if user exist with this email
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(404, "User with this email does not exist")
    };

    // reset token generate
    const resetToken = user.generateAccessToken();

    // save rest token and expiration info to db
    await user.save({validateBeforeSave: false});

     // Create a reset URL
     const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/users/reset-password/${resetToken}`;
  
      // Message to send via email
      const message = `You are receiving this email because you requested a password reset. 
    Please make a PUT request to: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email.`;
  
      try {
        //  send the email
        await sendEmail(user.email, "Password Reset", message);
  
        res
          .status(200)
          .json(
            new ApiResponse(200, {}, "Password reset email sent successfully")
          );
      } catch (error) {
        (user as any).resetPasswordToken = undefined;
        (user as any).resetPasswordExpire = undefined;
  
        await user.save({ validateBeforeSave: false });
  
        throw new ApiError(500, "Email could not be sent");
      }
    
});

// reset password
export const resetPassword = asyncHandler(
    async (req, res) => {
      const { password } = req.body;
  
      // getting reset token from url and hash it for compare with the db
      const resetToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
  
      // Find the user with this token and check that the token hasn't expired
      const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpire: { $gt: Date.now() }, // Ensure token is not expired
      });
  
      if (!user) {
        throw new ApiError(400, "Invalid or expired token");
      }
  
      // Update the user's password and clear the reset token fields
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save();
  
      res
        .status(200)
        .json(new ApiResponse(200, {}, "Password reset successfully"));
    }
  );