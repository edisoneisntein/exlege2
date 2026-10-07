import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(request: Request) {
  const origin = request.headers.get("Origin") || "";
  if (origin !== process.env.ALLOWED_ORIGIN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }

  const authHeader = request.headers.get("Authorization") || "";
  const expectedToken = `Bearer ${process.env.GEMINI_APP_TOKEN}`;
  if (authHeader !== expectedToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { contents, model, config, stream } = await request.json();
    
    if (stream) {
      // Handle streaming request
      const streamResponse = await ai.models.generateContentStream({
        model,
        contents,
        ...config
      });
      
      // Create a readable stream from the generator response
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              if (chunk.text) {
                // Format as Server-Sent Event
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: chunk.text })}\n\n`));
              }
            }
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          } catch (error) {
            console.error("Error in Gemini stream:", error);
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: "Internal error" })}\n\n`));
          } finally {
            controller.close();
          }
        }
      });
      
      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    } else {
      // Handle regular request
      const response = await ai.models.generateContent({ model, contents, ...config });
      return new Response(JSON.stringify({ text: response.text }), {
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
}
