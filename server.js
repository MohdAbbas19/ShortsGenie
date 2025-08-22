import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { spawn } from "child_process";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ✅ Route for script generation
app.post("/generate-script", async (req, res) => {
  const { topic, lang, length } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt;
    switch (length) {
      case "short":
        prompt = `
          Write a 30-second YouTube Shorts script narration in ${lang} about: ${topic}.
          Output only the spoken narration as one paragraph.
        `;
        break;
      case "long":
        prompt = `
          Write a detailed YouTube video script narration in ${lang} about: ${topic}.
          It should be long enough for about 2–5 minutes of spoken content (~500–700 words).
          Output only the spoken narration as continuous text.
        `;
        break;
      case "ten":
        prompt = `
          Write a comprehensive YouTube video script narration in ${lang} about: ${topic}.
          It should be detailed enough for about 10 minutes of spoken content (~1300–1500 words).
          Output only the spoken narration as continuous text.
        `;
        break;
      case "fifteen":
        prompt = `
          Write an in-depth YouTube video script narration in ${lang} about: ${topic}.
          It should be detailed enough for about 15 minutes of spoken content (~2000–2200 words).
          Output only the spoken narration as continuous text.
        `;
        break;
      default:
        prompt = `
          Write a 30-second YouTube Shorts script narration in ${lang} about: ${topic}.
          Output only the spoken narration as one paragraph.
        `;
    }

    const result = await model.generateContent(prompt);
    let script = result.response.text();

    // 🔥 Clean unwanted stuff
    script = script
      .replace(/##.*?\n/g, "")
      .replace(/\*\*.*?\*\*/g, "")
      .replace(/\*.*?\*/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/#\w+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    res.json({ script: script || "⚠️ No script generated" });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Failed to generate script" });
  }
});



// ✅ Route for audio generation with Python (gTTS)
app.post("/generate_audio", (req, res) => {
  const { text, voiceLang } = req.body;
  const python = spawn("python", ["tts.py", text, voiceLang]);

  python.stdout.on("data", (data) => {
    const filename = data.toString().trim();
    res.json({ audio: `/${filename}` });
  });

  python.stderr.on("data", (data) => {
    console.error(`Python Error: ${data}`);
  });
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
