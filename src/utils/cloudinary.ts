import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

//  upload function
const uploadOnCloudinary = async (localFilePath: any) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      transformation: [{ crop: "limit" }, { quality: 90 }],
    });

    // Remove the local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    // remove locally saved temp file after upload failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
