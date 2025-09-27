import { PurchaseController } from "@/controllers/purchaseController";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest){
  return PurchaseController.handlingWebhook(req)
}