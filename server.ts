import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/generate-hotel", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getGenAI();
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt ? `Design a hotel layout based on: ${prompt}` : "Design a hotel layout.",
        config: {
          systemInstruction: `You are an expert hotel architect.
Generate a multi-floor 2D floor plan for a hotel based on the user's prompt. Each floor level has a 20x20 grid (20 columns width, 20 rows height).
Each cell in the grid represents a tile type. Use ONLY these exact characters:
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
'X' = emergency stairs

Important rules for layout:
- If the user specifies a number of floors (e.g. "a 10 floor hotel", "3 floors"), generate exactly that number of floors (up to 10 floors). If they do not specify, default to generating 2 floors.
- The ground floor (level 0) represents the Lobby, containing reception desk ('R'), some plants ('P'), seating tables ('T'), elevators ('E'), and stairs ('X'). It must have at least one main entrance door ('D') on the outer wall.
- Upper floors (level 1 and above) MUST contain modular hotel suites and continuous hallways.
- Each suite on upper floors MUST be enclosed by walls ('#'), and MUST contain:
  1. Exactly one bed ('B')
  2. Exactly one bathroom ('b')
  3. Exactly one door ('D') built into the suite's wall that opens directly into the central hallway corridor ('.'). Do NOT omit doors!
- Hallways/Corridors MUST be continuous pathways constructed of floor tiles ('.') that directly connect EVERY suite's entrance door ('D') to the elevators ('E') and stairs ('X').
- Outer boundaries MUST be closed with walls ('#'), but you MUST include multiple windows ('W') on the outer walls of both the lobby and the suites so guests can view the outside scenery.
- CRITICAL Vertices Alignment: Elevators ('E') AND emergency stairs ('X') MUST align at the EXACT same (X, Y) coordinates across all floors of the hotel where they exist (e.g., elevators 'E' at row 15, cols 6-7, and stairs 'X' at row 19, cols 9-10) to make vertical travel work correctly.
- Each floor's grid MUST contain exactly 20 rows (strings) and each string MUST be exactly 20 characters long. Any other size will break the application.

Here is a template demonstrating how to structure a Guest Floor (level 1+) with enclosed rooms, beds ('B'), bathrooms ('b'), windows ('W'), doors ('D'), and continuous hallways ('.') leading to elevators ('E') and stairs ('X'):

Example Guest Floor Grid (20x20):
[
  "####################",
  "#b.B.#..b.B.#..b.B.#",
  "#....#......#......#",
  "#....D......D......#",
  "###D######D######D##",
  "W..................W",
  "W...EE......XX.....W",
  "W...EE......XX.....W",
  "###D######D######D##",
  "#....D......D......#",
  "#....#......#......#",
  "#b.B.#..b.B.#..b.B.#",
  "####################",
  "W..................W",
  "W..................W",
  "W..................W",
  "W..................W",
  "W..................W",
  "W..................W",
  "####################"
]`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              floors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.INTEGER, description: "The level index of the floor (starting at 0 for ground floor)" },
                    name: { type: Type.STRING, description: "Name of the floor (e.g., 'Ground Floor Lobby', 'Level 1 Guest Suites', 'Level 2 Executive Rooms')" },
                    grid: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Array of exactly 20 strings. Each string must be exactly 20 characters long representing one row of the 20x20 grid."
                    },
                    labels: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          x: { type: Type.INTEGER, description: "X coordinate of the label text (0 to 19)" },
                          y: { type: Type.INTEGER, description: "Y coordinate of the label text (0 to 19)" },
                          text: { type: Type.STRING, description: "Label text describing the area" }
                        },
                        required: ["x", "y", "text"]
                      },
                      description: "List of labels for this floor."
                    }
                  },
                  required: ["level", "name", "grid", "labels"]
                },
                description: "List of hotel floors. Generate exactly the number of floors requested by the user, up to 10 floors max."
              }
            },
            required: ["floors"]
          }
        }
      });

      if (!response.text) {
        throw new Error("No response content generated by the AI model.");
      }

      const parsed = JSON.parse(response.text.trim());
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
