// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";
import { generateReply } from "../../completions";
import { CHARACTERS } from "../../characters";

dotenv.config();

console.log("Starting chat API initialization");
if (!CHARACTERS || CHARACTERS.length === 0) {
  throw new Error("No characters loaded from characters.json.");
}
const defaultCharacter = CHARACTERS[0];
console.log("Loaded default character:", defaultCharacter.agentName);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Handler called");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body as { message?: string };
    console.log("Received message:", message);
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Calling generateReply");
    const { reply } = await generateReply(message, defaultCharacter, true);
    console.log("Generated reply:", reply);

    return res.status(200).json({ response: reply });
  } catch (error) {
    console.error("Error in handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}