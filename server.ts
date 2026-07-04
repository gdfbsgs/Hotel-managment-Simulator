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
- The ground floor (level 0) should represent the Grand Entrance and Reception Lobby:
  - It MUST contain the reception desk ('R') placed near the front-center entrance area (e.g. around y = 14 to 17, x = 10).
  - It should contain a beautiful lobby seating area with tables ('T'), decorative plants ('P'), elevator ('E'), and stairs ('X').
  - The floor tiles under all furniture (beds, bathrooms, tables, reception, plants, elevators, stairs) must be floor tiles ('.'). So ensure any indoor areas are filled with '.' as floor underlay, bounded by walls ('#').
- Upper floors (level 1 and above) should contain hotel guest rooms:
  - Divide the space into distinct modular hotel suites. Each suite must be fully enclosed by walls ('#').
  - Inside each suite, place exactly one bed ('B'), a private bathroom ('b'), and a suite entrance door ('D') that connects directly to a continuous, wide central hallway ('.').
  - Include windows ('W') on outer walls for natural light and scenery views.
- Central Hallway Requirement: Each floor MUST contain a clear, continuous central corridor (built of '.' floor tiles) that directly connects the entrance door of every single room ('D') to both the elevators ('E') and the emergency stairs ('X') so guests can move around easily.
- Outer boundaries: All floor plans must be closed with outer walls ('#'), but with a few scenic windows ('W') and at least one entrance containing doors ('D') on the ground floor.
- CRITICAL Vertices Alignment: Elevators ('E') AND emergency stairs ('X') MUST align at the EXACT same (X, Y) coordinates across all floors of the hotel where they exist (e.g. elevator 'E' at column 2, row 2; stairs 'X' at column 17, row 17 across Ground Floor, Level 1, Level 2, etc.) so vertical transit and emergency evacuation works perfectly.
- Each floor's grid must contain exactly 20 strings, and each string must be exactly 20 characters long. Any deviation in row or column count will break the application.`,
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
