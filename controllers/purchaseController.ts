import { NextResponse, NextRequest } from "next/server";
import { razorpay } from "@/lib/config";
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto"
import { prisma } from '@/lib/prisma';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export class PurchaseController {

  static async createPurchase(req: NextRequest) {
    try {
      const { price, programId } = await req.json();
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (!price)
        return NextResponse.json({ error: 'Price is required' }, { status: 400 });
      const order = await razorpay.orders.create({
        amount: Math.round(parseFloat(price) * 100), // Convert to paise
        currency: 'INR',
        receipt: `r_${uuidv4()}`, // Unique receipt ID
        notes: {
          learnerId: Number(session.user.id),
          programId: Number(programId),
        },
      })

      return NextResponse.json({ orderId: order.id }, { status: 201 });
    } catch (error) {
      console.error("Purchase creation error:", error);
      return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
    }

  }

  static async handlingWebhook(req: NextRequest) {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET!
      const signature = req.headers.get("x-razorpay-signature") || ""
      // read raw text body (exact bytes) 
      const rawBody = await req.text()

      // verify signature using raw body
      const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
      if (signature !== expected) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 })
      }
      // এখন parse করেই payload নেবো 
      const payload = JSON.parse(rawBody)
      const event = payload.event
      if (event === "payment.captured") {
        const payment = payload.payload.payment.entity
        const programId = payment.notes?.programId
        const learnerId = payment.notes?.learnerId
        const existingEnrollment = await prisma.enrollment.findFirst({
        where: { learnerId: learnerId, programId: programId }
      });

      if (existingEnrollment) {
        return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 409 });
      }

      const enrollment = await prisma.enrollment.create({
        data: { learnerId: learnerId, programId: programId }
      });
        return NextResponse.json({ success: true, enrolled: enrollment }, { status: 201 });
      }

    } catch (error) {
      console.error('Failed to handle', error)
      return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
    }
  }


}