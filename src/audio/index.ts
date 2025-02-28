// src/audio/index.ts
import { CHARACTERS } from "../characters";
import { KokoroAudioProvider } from "./providers/kokoro";
import { OpenAIAudioProvider } from "./providers/openai";
import { AudioProvider } from "./types";
type Character = (typeof CHARACTERS)[number];

const providers: Record<string, AudioProvider> = {
  kokoro: new KokoroAudioProvider(),
  openai: new OpenAIAudioProvider(),
};

export async function generateAudio(
  text: string,
  character: Character,
): Promise<Response> {
  const provider =
    providers[character.audioGenerationBehavior?.provider || "kokoro"];
  if (!provider) {
    throw new Error(
      `Audio provider not found: ${character.audioGenerationBehavior?.provider}`,
    );
  }

  console.log("Using audio provider:", character.audioGenerationBehavior?.provider); // Replace logger.info
  return await provider.generateAudio(text, character);
}