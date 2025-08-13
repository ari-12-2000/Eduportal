import { NextResponse, NextRequest } from "next/server";
import { razorpay } from "@/lib/config";    
import { v4 as uuidv4 } from 'uuid';

export class PurchaseController {
     
    static async createPurchase(req: NextRequest) {
       try{
          const {price}= await req.json();
          if(!price)
            return NextResponse.json({error:'Price is required'}, {status:400});
          const order= await razorpay.orders.create({
            amount: Math.round(parseFloat(price) * 100), // Convert to paise
            currency: 'INR',
            receipt: `r_${uuidv4()}`, // Unique receipt ID
          })

          return NextResponse.json({ orderId:order.id }, { status: 201 });
       }catch(error) {
           console.error("Purchase creation error:", error);
           return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
       }
    }
}