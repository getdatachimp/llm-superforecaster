import { ForecastQuery, Prediction } from '../types'
import { promptGPT4 } from './openAi'
import buildPredictionPrompt from './buildPredictionPrompt'

export const generateGPT4Prediction = async ({
  query,
  summaries,
}: {
  query: ForecastQuery
  summaries: Array<string>
}): Promise<Prediction> => {
  const prompt = buildPredictionPrompt({ query, summaries })
  const rawPrediction = await promptGPT4(prompt)

  const probabilityMatch = rawPrediction.match(/\*(\d+(\.\d+)?)\*/g)
  if (!probabilityMatch) throw("Failed to generate prediction")
  const probability = Number(probabilityMatch[0].replace(/\*/g, ''))

  console.log(rawPrediction)

  return {
    probability,
    explanation: rawPrediction,
    source: 'gpt-4-1106-preview'
  }
}
