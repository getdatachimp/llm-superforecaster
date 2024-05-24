import { ForecastQuery, Prediction } from '../types'
import { promptGeminiPro } from './gemini'
import buildPredictionPrompt from './buildPredictionPrompt'

export const generateGeminiProPrediction = async ({
  query,
  summaries,
}: {
  query: ForecastQuery
  summaries: Array<string>
}): Promise<Prediction> => {
  const prompt = buildPredictionPrompt({ query, summaries })
  const rawPrediction = await promptGeminiPro(prompt)

  const probabilityMatch = rawPrediction.match(/\*(\d+(\.\d+)?)\*/g)
  if (!probabilityMatch) throw("Failed to generate prediction")
  const probability = Number(probabilityMatch[0].replace(/\*/g, ''))

  console.log(rawPrediction)

  return {
    probability,
    explanation: rawPrediction,
    source: 'gemini-1.0-pro-latest',
  }
}
