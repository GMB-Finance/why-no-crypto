// src/characters/index.ts
import fs from "fs";
import path from "path";

// Type definitions
export type CharacterPostingBehavior = {
  replyInterval?: number;
  topicInterval?: number;
  lowerBoundPostingInterval?: number;
  upperBoundPostingInterval?: number;
  removePeriods?: boolean;
  onlyKeepFirstSentence?: boolean;
  dontTweetAt?: string[];
  chatModeRules?: string[];
  chatModeModel?: string;
  shouldIgnoreTwitterReplies?: boolean;
  generateImagePrompt?: boolean;
  imagePromptChance?: number;
  stickerChance?: number;
  stickerFiles?: string[];
};

export type ImageGenerationBehavior = {
  provider: "ms2";
  imageGenerationPromptModel?: string;
  ms2?: {
    apiKey: string;
    cheesworldChance?: number; // Already added
    miladyChance?: number;     // Add this
  };
};

export type AudioGenerationBehavior = {
  provider: "openai" | "kokoro";
  openai?: {
    apiKey: string;
  };
  kokoro?: {
    // Add Kokoro-specific fields if needed
  };
};

export type Character = {
  agentName: string;
  username: string;
  twitterPassword: string;
  twitterEmail?: string;
  telegramApiKey: string;
  bio: string[];
  lore: string[];
  postDirections: string[];
  topics?: string[];
  adjectives?: string[];
  knowledge?: string[];
  telegramBotUsername?: string;
  discordBotUsername?: string;
  discordApiKey?: string;
  postingBehavior: CharacterPostingBehavior;
  model: string;
  fallbackModel: string;
  temperature: number;
  imageGenerationBehavior?: ImageGenerationBehavior;
  audioGenerationBehavior?: AudioGenerationBehavior;
};

function loadCharacterConfigs(): Character[] {
  const rootDir = process.cwd();
  const characterFilePath = path.join(rootDir, "public/data/characters.json");
  console.log("Loading characters from:", characterFilePath);
  const characterFile = fs.readFileSync(characterFilePath, "utf8");
  const configs = JSON.parse(characterFile);

  if (!Array.isArray(configs)) {
    throw new Error("characters.json must contain an array of character configurations");
  }

  return configs.map(config => ({
    ...config,
    twitterPassword: process.env[`AGENT_TWITTER_PASSWORD`] || "",
    twitterEmail: process.env[`AGENT_TWITTER_EMAIL`] || "",
    telegramApiKey: process.env[`AGENT_TELEGRAM_API_KEY`] || "",
    discordApiKey: process.env[`AGENT_DISCORD_API_KEY`] || "",
    discordBotUsername: config.discordBotUsername,
    imageGenerationBehavior:
      config.imageGenerationBehavior?.provider === "ms2"
        ? {
            ...config.imageGenerationBehavior,
            ms2: {
              ...config.imageGenerationBehavior.ms2,
              apiKey: process.env[`AGENT_MS2_API_KEY`] || "",
            },
          }
        : config.imageGenerationBehavior,
    audioGenerationBehavior:
      config.audioGenerationBehavior?.provider === "openai"
        ? {
            ...config.audioGenerationBehavior,
            openai: {
              ...config.audioGenerationBehavior.openai,
              apiKey: process.env[`AGENT_OPENAI_API_KEY`] || "",
            },
          }
        : config.audioGenerationBehavior,
  }));
}

export const CHARACTERS = loadCharacterConfigs();