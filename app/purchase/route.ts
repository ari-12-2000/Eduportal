import { NextRequest} from "next/server";
import { PurchaseController } from "@/controllers/purchaseController";

export async function POST(req: NextRequest) {
    return PurchaseController.createPurchase(req);
}