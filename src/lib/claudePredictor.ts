import { ForecastQuery, Prediction } from '../types'
import { promptClaudeOpus } from './anthropic'
import buildPredictionPrompt from './buildPredictionPrompt'

export const generateClaudeOpusPrediction = async ({
  query,
  summaries,
}: {
  query: ForecastQuery
  summaries: Array<string>
}): Promise<Prediction> => {
  const prompt = buildPredictionPrompt({ query, summaries })
  const rawPrediction = await promptClaudeOpus(prompt)

  const probabilityMatch = rawPrediction.match(/\*(\d+(\.\d+)?)\*/g)
  if (!probabilityMatch) throw("Failed to generate prediction")
  const probability = Number(probabilityMatch[0].replace(/\*/g, ''))

  console.log(rawPrediction)

  return {
    probability,
    explanation: rawPrediction,
    source: 'claude-3-opus-20240229',
  }
}
