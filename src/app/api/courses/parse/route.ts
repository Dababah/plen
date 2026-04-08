import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Pull AI Settings from Database (Manual user entry)
    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings || !settings.aiApiKeyEncrypted) {
      return NextResponse.json({ 
        error: "AI Connection Failed: AI belum di-setup di Settings",
        hint: "Please set up your API Key in Settings first."
      }, { status: 400 });
    }

    const apiKey = decrypt(settings.aiApiKeyEncrypted);
    const provider = settings.aiProvider || "google"; // Default to google if not set
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // OpenRouter Logic
    if (provider === "openrouter") {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://github.com/Stitch-AI/Planning",
          "X-Title": "Planning Dashboard",
        },
        body: JSON.stringify({
          model: settings.aiModel || "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: "Extract university course schedule from this image. Return ONLY a valid JSON array of objects. Fields: day (Senin/Selasa/etc), startTime (HH:mm), endTime (HH:mm), courseCode, courseName, className, lecturer, room. Don't include markdown fences." 
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${file.type};base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "OpenRouter Error");
      
      let content = data.choices?.[0]?.message?.content;
      if (content) {
        let parsed = JSON.parse(content);
        if (parsed.courses) parsed = parsed.courses;
        return NextResponse.json({ success: true, mockData: Array.isArray(parsed) ? parsed : [parsed] });
      }
    }

    // Google Gemini Direct Logic
    if (provider === "google") {
      const model = settings.aiModel || "gemini-1.5-flash";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Extract university course schedule from this image. Return ONLY a JSON array of objects with fields: day, startTime, endTime, courseCode, courseName, className, lecturer, room." },
              { inline_data: { mime_type: file.type, data: base64Data } }
            ]
          }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || "Gemini Error");
      
      const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const parsed = JSON.parse(content);
        return NextResponse.json({ success: true, mockData: parsed });
      }
    }

    throw new Error(`AI Provider ${provider} not supported for Image parsing yet.`);
  } catch (error: any) {
    console.error("[COURSES_PARSE]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
