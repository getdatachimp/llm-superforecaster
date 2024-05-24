import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

import APIConcurrencyQueue from './apiConcurrencyQueue'

const googlePool = new APIConcurrencyQueue({
  maxConnections: 1,
  buffer: 4_000,
})

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)

// https://ai.google.dev/models/gemini
const GEMINI_1_PRO_MODEL_NAME = 'gemini-1.0-pro-latest'

export const promptGeminiPro = async (
  prompt: string,
): Promise<string> => {
  const model = googleAI.getGenerativeModel({ model: GEMINI_1_PRO_MODEL_NAME })
  return promptGemini({
    prompt,
    model,
    modelName: GEMINI_1_PRO_MODEL_NAME,
  })
}

const promptGemini = async ({
  prompt,
  model,
  modelName,
}: {
  prompt: string
  model: GenerativeModel
  modelName: string
}): Promise<string> => {
  const geminiRequest = async () => {
    // https://ai.google.dev/docs/gemini_api_overview#text_input
    const result = await model.generateContent(prompt)
    return result.response.text()
  }

  return googlePool.queueWithRetries({
    task: geminiRequest,
    name: `prompt Google model ${modelName}`,
  })
}
