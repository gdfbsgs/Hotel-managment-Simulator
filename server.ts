import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/generate-hotel", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || "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"}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Hotel Generator",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are an expert hotel architect.
Generate a 2D floor plan for a hotel on a 20x16 grid (20 columns width, 16 rows height).
Use ONLY these exact characters for the grid strings:
' ' (space) = empty
'.' = floor
'#' = wall
'D' = door
'W' = window
'B' = bed
'b' = bathroom
'R' = reception
'S' = staff
'P' = plant
'T' = table
'E' = elevator

Return exactly 16 strings, each exactly 20 characters long. Represent a functional floor plan. Wrap the exterior with walls ('#'), place an entrance with doors ('D'), reception ('R') near entrance, elevators ('E'), and rooms (containing 'B' and 'b').

You MUST return a valid JSON object with this EXACT structure:
{
  "grid": ["...", "...", ... 16 strings total],
  "labels": [
    { "x": 2, "y": 2, "text": "Room 1" }
  ]
}`
            },
            {
              role: "user",
              content: prompt ? `Design a hotel layout based on: ${prompt}` : "Design a hotel layout."
            }
          ]
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || "OpenRouter API error");
      }
      
      const parsed = JSON.parse(data.choices[0].message.content);
      res.json(parsed);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to generate layout" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
