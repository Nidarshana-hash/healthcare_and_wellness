import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ VERIFY API KEY
console.log(
  "OPENAI KEY LOADED:",
  process.env.OPENAI_API_KEY ? "YES" : "NO"
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------------- AI ARTICLES API ---------------- */
app.get("/api/ai-articles", async (req, res) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `
Generate 6 healthcare and wellness articles.

Return ONLY valid JSON in this exact format:
{
  "articles": [
    {
      "id": 1,
      "title": "Article title",
      "author": "AI Health Assistant",
      "readTime": "5 min read",
      "category": "Nutrition",
      "image": "https://images.unsplash.com/...",
      "content": "3 short paragraphs"
    }
  ]
}
`,
    });

    // ✅ Extract text safely
    const outputText = response.output_text;

    if (!outputText) {
      throw new Error("No output text from OpenAI");
    }

    const parsed = JSON.parse(outputText);

    res.json(parsed.articles);
  } catch (error) {
    console.error("OPENAI ERROR:", error);
    res.status(500).json({
      error: "AI article generation failed",
      details: error.message,
    });
  }
});

/* ---------------- ROOT CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("AI Backend Running 🚀");
});

app.listen(5000, () => {
  console.log("AI backend running on http://localhost:5000");
});
