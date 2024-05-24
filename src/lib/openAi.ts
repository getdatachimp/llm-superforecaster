import OpenAI from 'openai'

import APIConcurrencyQueue from './apiConcurrencyQueue'

const openAIPool = new APIConcurrencyQueue({
  maxConnections: 2,
  buffer: 4_000,
})

export const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
})

export enum OpenAIModel {
  GPT3 = "gpt-3.5-turbo-1106",
  GPT4 = "gpt-4-1106-preview",
  GPT4_TURBO = 'gpt-4-turbo-2024-04-09',
  GPT4_OMNI = 'gpt-4o',
}

export const promptGPT4o = async (prompt: string): Promise<string> => {
  return promptGPT({ prompt, model: OpenAIModel.GPT4_OMNI })
}

export const promptGPT4Turbo = async (prompt: string): Promise<string> => {
  return promptGPT({ prompt, model: OpenAIModel.GPT4_TURBO })
}

export const promptGPT4 = async (prompt: string): Promise<string> => {
  return promptGPT({ prompt, model: OpenAIModel.GPT4 })
}

export const promptGPT3Turbo = async (prompt: string): Promise<string> => {
  return promptGPT({ prompt, model: OpenAIModel.GPT3 })
}

const promptGPT = async ({
  prompt,
  model,
}: {
  prompt: string,
  model: OpenAIModel,
}): Promise<string> => {
  const chatRequest = async () => {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model,
    })
    return completion.choices[0].message.content
  }

  return openAIPool.queueWithRetries({
    task: chatRequest,
    name: `prompt OpenAI model ${model}`,
  })
}
