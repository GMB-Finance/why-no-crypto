import { Character } from "./characters";
import { generateReply } from "./completions";

export async function handleChatMessage(
  input: string,
  character: Character,
  isGroup: boolean = false,
  chatHistory?: string
): Promise<string> {
  try {
    const completion = await generateReply(input, character, isGroup, chatHistory);
    return completion.reply; // Extract just the reply from the returned object
  } catch (error) {
    console.error("Error in chat message handling:", error);
    return "Sorry, I encountered an error processing your message.";
  }
}
