import Razorpay from "razorpay";
import {v2 as cloudinary} from "cloudinary";

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID!,
  key_secret: process.env.RAZORPAY_TEST_SECRET_KEY!,
})

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary }