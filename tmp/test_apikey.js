
const apiKey = "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";
const provider = "openrouter";
const model = "google/gemini-2.0-flash-exp:free"; // Use a cheap/free model for testing

async function test() {
  console.log("Testing OpenRouter API Key...");
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Planning Dashboard"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: "hi" }]
      })
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));

    if (res.ok) {
        console.log("SUCCESS: API Key is working!");
    } else {
        console.log("FAILURE: API Key or Provider error.");
    }
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

test();
