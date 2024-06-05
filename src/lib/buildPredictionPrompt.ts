import { ForecastQuery } from '../types'

const getCurrentDateFormatted = () => {
  const date = new Date()
  const options = { year: 'numeric', month: 'long', day: 'numeric' } as any
  return date.toLocaleDateString('en-US', options)
}

const buildPredictionPrompt = ({
  query,
  summaries,
}: {
  query: ForecastQuery
  summaries: string[]
}): string => {
  // Make a bulleted list of article summaries.
  const formattedArticles = ["", ...summaries].join("\n- ")

  // https://arxiv.org/pdf/2402.18563, p30
  return `
Question: ${query.question}
Question Background: ${query.background}
Resolution Criteria: ${query.resolutionCriteria}
Today’s date: ${getCurrentDateFormatted()}
Question close date: ${query.closeDate}

We have retrieved the following information for this question:
${formattedArticles}

Instructions:
1. Given the above question, rephrase and expand it to help you to better answer it. Maintain all information in the original question.
{{ Insert rephrased and expanded question. }}
2. Using your knowledge of the world and topic, as well as the information provided, give a few reasons why the answer might be no. Rate the strength of each reason.
{{ Insert your thoughts }}
3. Using your knowledge of the world and topic, as well as the information provided, give a few reasons why the answer might be yes. Rate the strength of each reason.
{{ Insert your thoughts }}
4. Aggregate your considerations. Think like a superforecaster (e.g. Nate Silver).
{{ Insert your aggregated considerations }}
5. Output an initial probability (prediction) given steps 1-4.
{{ Insert initial probability }}
6. Evaluate whether your calculated probability is excessively confident or not confident enough. Also, consider anything else that might affect the forecast that you did not before consider (e.g. base rate of the event).
{{ Insert your thoughts }}
7. Output your final prediction (a number between 0 and 1) with an asterisk at the beginning and end of the decimal.
{{ Insert your answer }}
`
}

export default buildPredictionPrompt
