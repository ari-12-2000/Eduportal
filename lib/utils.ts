import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Razorpay from "razorpay";
import {v2 as cloudinary} from "cloudinary";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID!,
  key_secret: process.env.RAZORPAY_TEST_SECRET_KEY!,
})

