import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Received webhook from Cloudinary:", body);

    // Optional: Update DB with transformation result, e.g.
    // await prisma.video.update({ where: { publicId }, data: { transformedUrl: body.eager[0].secure_url } });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
