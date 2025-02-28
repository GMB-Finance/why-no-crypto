// src/completions.ts
import OpenAI from "openai";
import { type Character } from "./characters";

export const openai = new OpenAI({
  baseURL: process.env["LLM_PROVIDER_URL"] || "",
  apiKey: process.env["LLM_PROVIDER_API_KEY"] || "",
});

const MAX_OUTPUT_TOKENS = 95;

interface PromptContext extends Record<string, string> {
  agentName: string;
  username: string;
  bio: string;
  lore: string;
  postDirections: string;
  originalPost: string;
  knowledge: string;
  chatModeRules: string;
  recentHistory: string;
}

const IMAGE_GENERATION_PROMPT_MS2 = `# MS2 Image Prompt Generator
You are {{agentName}}, with bio:
{{bio}}

And lore:
{{lore}}

Your posting directions are:
{{postDirections}}

Given the prompt '{{originalPost}}', rewrite it into a concise, creative prompt suitable for generating an image with Midjourney-style syntax (e.g., '/imagine prompt: ...'). Keep it vivid, specific, and aligned with your character. Limit output to 95 tokens.
`;

const REPLY_GUY_PROMPT = `# Reply Guy Prompt
You are {{agentName}}, with bio:
{{bio}}

And lore:
{{lore}}

Your posting directions are:
{{postDirections}}

Reply to this post: '{{originalPost}}' with a concise, witty response that fits your character. Keep it under 280 characters.
`;

const REPLY_GUY_PROMPT_SHORT = `# Short Reply Guy Prompt
You are {{agentName}}. Reply to '{{originalPost}}' with a short, sharp quip that matches your vibe. Keep it under 280 characters.
`;

const PROMPT_CHAT_MODE = `# Chat Mode Prompt
You are {{agentName}}, with bio:
{{bio}}

And lore:
{{lore}}

Your posting directions are:
{{postDirections}}

Chat rules:
{{chatModeRules}}

Recent chat history:
{{recentHistory}}

Respond to '{{originalPost}}' in character, keeping it concise and engaging.
`;

const TOPIC_PROMPT = `# Topic Post Prompt
You are {{agentName}}, with bio:
{{bio}}

And lore:
{{lore}}

Your posting directions are:
{{postDirections}}

Recent posts:
{{recentHistory}}

Generate a post based on a topic and adjective provided by the user.
`;

const WAS_PROMPT_BANNED = `# Ban Check Prompt
You are {{agentName}} (@{{username}}). Given this reply: '{{originalPost}}', would it be banned on Twitter? Answer YES or NO in all caps.`;

const generatePrompt = (
  context: PromptContext,
  isChatMode: boolean,
  inputLength: number,
) => {
  if (isChatMode) {
    return context.knowledge
      ? replaceTemplateVariables(
          `# Knowledge\n{{knowledge}}\n\n${PROMPT_CHAT_MODE}`,
          context,
        )
      : replaceTemplateVariables(PROMPT_CHAT_MODE, context);
  }

  const basePrompt =
    inputLength <= 20 ? REPLY_GUY_PROMPT_SHORT : REPLY_GUY_PROMPT;

  return context.knowledge
    ? replaceTemplateVariables(
        `# Knowledge\n{{knowledge}}\n\n${basePrompt}`,
        context,
      )
    : replaceTemplateVariables(basePrompt, context);
};

export async function generateImagePromptForCharacter(
  prompt: string,
  character: Character,
): Promise<string> {
  console.log("Generating image prompt for character:", character.agentName); // Replace logger.info

  let imagePrompt = replaceTemplateVariables(IMAGE_GENERATION_PROMPT_MS2, {
    agentName: character.agentName,
    bio: character.bio.join("\n"),
    lore: character.lore.join("\n"),
    postDirections: character.postDirections.join("\n"),
    knowledge: character.knowledge?.join("\n") || "",
    originalPost: prompt,
    username: character.username,
  });

  try {
    const completion = await openai.chat.completions.create({
      model:
        character.imageGenerationBehavior?.imageGenerationPromptModel ||
        character.model,
      messages: [{ role: "user", content: imagePrompt }],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: character.temperature,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("No completion content received from API");
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating image prompt:", error); // Replace logger.error
    throw error;
  }
}

const generateCompletionForCharacter = async (
  prompt: string,
  character: Character,
  isChatMode: boolean = false,
  userPrompt?: string,
) => {
  let model = isChatMode && character.postingBehavior.chatModeModel ? character.postingBehavior.chatModeModel : character.model;
  console.log("Using model:", model); // Add debug log

  if (userPrompt) {
    console.log("User prompt:", userPrompt); // Replace logger.debug
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: character.temperature,
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error(`No content in API response: ${JSON.stringify(completion)}`);
    }

    return completion.choices[0].message.content;
  }

  const completion = await openai.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: character.temperature,
  });

  if (!completion.choices?.[0]?.message?.content) {
    throw new Error(`No content in API response: ${JSON.stringify(completion)}`);
  }

  return completion.choices[0].message.content;
};

export const handleBannedAndLengthRetries = async (
  prompt: string,
  generatedReply: string,
  character: Character,
  maxLength: number = 280,
  banThreshold: number = 3,
  inputMessage?: string,
) => {
  let currentReply = generatedReply;
  let banCount = 0;
  let wasBanned = await checkIfPromptWasBanned(currentReply, character);

  while (wasBanned || currentReply.length > maxLength) {
    if (wasBanned) {
      banCount++;
      console.log(`The prompt was banned! Attempt ${banCount}/${banThreshold}`); // Replace logger.info

      if (banCount >= banThreshold && character.fallbackModel) {
        console.log("Switching to fallback model:", character.fallbackModel); // Replace logger.info
        const originalModel = character.model;
        character.model = character.fallbackModel;
        currentReply = await generateCompletionForCharacter(prompt, character, false, inputMessage);
        character.model = originalModel;
        break;
      }
    } else {
      console.log(`The content was too long (>${maxLength})! Going again.`); // Replace logger.info
    }

    currentReply = await generateCompletionForCharacter(prompt, character, false, inputMessage);
    wasBanned = await checkIfPromptWasBanned(currentReply, character);
  }

  return currentReply;
};

export const generateReply = async (
  inputMessage: string,
  character: Character,
  isChatMode: boolean = false,
  recentHistory?: string,
) => {
  try {
    const context = {
      agentName: character.agentName,
      username: character.username,
      bio: character.bio.join("\n"),
      lore: character.lore.join("\n"),
      postDirections: character.postDirections.join("\n"),
      originalPost: inputMessage,
      knowledge: character.knowledge?.join("\n") || "",
      chatModeRules: character.postingBehavior.chatModeRules?.join("\n") || "",
      recentHistory: recentHistory || "",
    };

    const prompt = generatePrompt(context, isChatMode, inputMessage.length);
    console.log("Prompt:", prompt); // Replace logger.debug

    let reply = await generateCompletionForCharacter(prompt, character, isChatMode, inputMessage);
    console.log("Reply:", reply); // Replace logger.debug

    if (!isChatMode) {
      reply = await handleBannedAndLengthRetries(prompt, reply, character, 280, 3, inputMessage);
    }

    reply = formatReply(reply, character);
    return { prompt, reply };
  } catch (error) {
    console.error("Error generating reply:", error); // Replace logger.error
    throw error;
  }
};

export const generateTopicPost = async (
  character: Character,
  recentHistory: string,
) => {
  const topic = character.topics!.sort(() => Math.random() - 0.5).slice(0, 1)[0];
  const adjective = character.adjectives!.sort(() => Math.random() - 0.5).slice(0, 1)[0];
  const context = {
    agentName: character.agentName,
    username: character.username,
    bio: character.bio.join("\n"),
    lore: character.lore.join("\n"),
    postDirections: character.postDirections.join("\n"),
    recentHistory: recentHistory || "",
  };

  const userPrompt = `Generate a post that is ${adjective} about ${topic}`;
  let prompt = replaceTemplateVariables(TOPIC_PROMPT, context);
  let reply = await generateCompletionForCharacter(prompt, character, false, userPrompt);

  reply = await handleBannedAndLengthRetries(prompt, reply, character, 280, 3);
  reply = reply.replace(/\\n/g, "\n");

  console.log(`<b>${character.username}, topic: ${topic}, adjective: ${adjective}</b>:\n\n${reply}`); // Replace logger.info
  return { prompt, reply };
};

const checkIfPromptWasBanned = async (reply: string, character: Character) => {
  const context = {
    agentName: character.agentName,
    username: character.username,
  };
  const banCheckPrompt = replaceTemplateVariables(WAS_PROMPT_BANNED, context);
  const result = await generateCompletionForCharacter(banCheckPrompt, character, false, reply);
  return result.trim().toUpperCase() === "YES";
};

const formatReply = (reply: string, character: Character) => {
  let formattedReply = reply.replace(/\\n/g, "\n");

  if (character.postingBehavior.removePeriods) {
    formattedReply = formattedReply.replace(/\./g, "");
  }

  if (character.postingBehavior.onlyKeepFirstSentence) {
    formattedReply = formattedReply.split("\n")[0];
  }

  console.log("Formatted reply:", formattedReply); // Replace logger.debug
  return formattedReply;
};

function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>,
) {
  return template.replace(/{{(\w+)}}/g, (_, key) => variables[key] || "");
}
