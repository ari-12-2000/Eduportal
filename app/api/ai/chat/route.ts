import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Program } from "@/lib/generated/prisma";
import { cleanJSON } from "@/lib/utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid request: message is required" },
        { status: 400 }
      );
    }

    // Select the free / fast Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // Ask Gemini to extract the category or course name in strict JSON
    const prompt = `
You are a classification assistant for an LMS.
Your job is ONLY to extract exactly this JSON:

{
  "category": string | null,
  "courseName": string | null,
  "select": object | null
}

Rules:
- If user asks general topic like "I want React courses", category = "React"
- If user asks a specific course like "Full-Stack React Bootcamp", courseName = "Full-Stack React Bootcamp"
- If user asks for all the categories or all the courses assign 'all' string to the category or courseName property.
- Never return the category and course name at the same time. Give priority to the course name if user specifies both category and course name. 
- If user asks to view some properties for a particular course or the courses of a particular category like title, send the properties inside a select object like select:{ title:true, instructor:true}, otherwise select:null.
- Only return a single JSON object (no additional text or explanation).
User message:
${message}
`;

    // Note: the SDK returns an object with a .response that has a .text() async method
    const aiResponse = await model.generateContent(prompt);

    // read the AI text output (safe access)
    const raw =
      aiResponse &&
        (aiResponse as any).response &&
        typeof (aiResponse as any).response.text === "function"
        ? (await (aiResponse as any).response.text()).trim()
        : String((aiResponse as any)?.response || "").trim();

    if (!raw) {
      return NextResponse.json(
        { success: false, error: "AI returned empty response" },
        { status: 500 }
      );
    }

    // Try parsing JSON returned by the model

    let extracted: { category: string | null; courseName: string | null; select: object | null } | null =
      null;
    try {
      const cleaned = cleanJSON(raw);
      extracted = JSON.parse(cleaned);
    } catch (err) {
      // Return raw AI output to help debugging if it failed to produce pure JSON
      return NextResponse.json(
        { success: false, error: "Invalid JSON returned by AI", aiRaw: raw },
        { status: 500 }
      );
    }

    if (extracted === null) {
      return NextResponse.json(
        { success: false, error: "AI returned null JSON" },
        { status: 500 }
      );
    }
    // Validate shape minimally
    if (
      typeof extracted !== "object" ||
      (!("category" in extracted) && !("courseName" in extracted))
    ) {
      return NextResponse.json(
        { success: false, error: "AI returned unexpected JSON shape", aiRaw: raw },
        { status: 500 }
      );
    }

    // Query the DB using Prisma based on extracted data
    let programs: any[] = [];


    if (extracted.category == 'all') {
      const categories = await prisma.program.findMany({
        select: { category: true },
        distinct: ['category'],
      });
      return NextResponse.json({
        success: true,
        aiUnderstanding: extracted,
        results: categories,
      });
    } else if (extracted.courseName == 'all') {
      const courses = await prisma.program.findMany()
      return NextResponse.json({
        success: true,
        aiUnderstanding: extracted,
        results: courses
      })
    }
    
    if (extracted.category) {
      if (extracted.select)
        programs = await prisma.program.findMany({
          where: {
            category: extracted.category.toLowerCase(),
          },
          select: extracted.select
        });
      else
        programs = await prisma.program.findMany({
          where: {
            category: extracted.category,
          },
        });
    } else if (extracted.courseName) {
      if (extracted.select)
        programs = await prisma.program.findMany({
          where: {
            title: extracted.courseName
          },
          select: extracted.select
        });
      else
        programs = await prisma.program.findMany({
          where: {
            title: extracted.courseName
          },

        });
    }

    return NextResponse.json({
      success: true,
      aiUnderstanding: extracted,
      results: programs,
    });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
