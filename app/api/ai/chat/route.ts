import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { cleanJSON } from "@/lib/utils";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type AIExtraction = {
  category: string | null;
  courseName: string | null;
  select: Record<string, boolean> | null;
};

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid request: message is required" },
        { status: 400 }
      );
    }

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
- If user asks for all the categories or all the courses assign 'all' string to the category or courseName property respectively. 
- But don't assign 'all' to the coursename or category property if the user asks for a specific thing. Eg:if the user asks for all the react courses, the category is react, not all.
- Never return the category and course name at the same time. Give priority to the course name if user specifies both category and course name. 
- If user asks to view some properties for a particular course or the courses of a particular category like title, send the properties inside a select object like select:{ title:true, instructor:true}, otherwise select:null.
- Only return a single JSON object (no additional text or explanation).
User message:
${message}
`;

    // Note: the SDK returns an object with a .response that has a .text() async method
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // read the AI text output (safe access)
    const raw =aiResponse.text;

    if (!raw) {
      return NextResponse.json(
        { success: false, error: "AI returned an empty response" },
        { status: 500 }
      );
    }

    // Try parsing JSON returned by the model

    let extracted: AIExtraction;
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
      (!("category" in extracted) && !("courseName" in extracted) && !("select" in extracted))
    ) {
      return NextResponse.json(
        { success: false, error: "AI returned unexpected JSON shape", aiRaw: raw },
        { status: 500 }
      );
    }

    // Query the DB using Prisma based on extracted data
    let programs: unknown[] = [];


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
            category: {
              contains: extracted.category,
              mode: "insensitive"
            },
          },
          select: extracted.select
        });
      else
        programs = await prisma.program.findMany({
          where: {
            category: {
              contains: extracted.category,
              mode: "insensitive"
            },
          },
        });
    } else if (extracted.courseName) {
      if (extracted.select)
        programs = await prisma.program.findMany({
          where: {
            title: {
              contains: extracted.courseName,
              mode: "insensitive"
            },
          },
          select: extracted.select
        });
      else
        programs = await prisma.program.findMany({
          where: {
            title: {
              contains: extracted.courseName,
              mode: "insensitive"
            },
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
