import {ForecastQuery, NewsQueries, Prediction} from '../types'
import {promptGPT4} from './openAi'

const buildPromptA = (
  question,
  background,
  numQueries = 6,
  maxWords = 10
): string => {
  // https://arxiv.org/pdf/2402.18563, p28
  return `
I will provide you with a forecasting question and the background information for the question.

Question: ${question}
Background: ${background}

Task:
- Generate brief search queries (up to ${maxWords} words each) to gather information on Google that could influence the forecast.

You must generate this exact amount of queries: ${numQueries}

Your response should take the following structure:
Thoughts: {{ Insert your thinking here. }}
Search Queries: {{ Insert the queries here. Use semicolons to separate the queries. }}
`
}

const buildPromptB = (
  question,
  background,
  numQueries = 6,
  maxWords = 10
): string => {
  // https://arxiv.org/pdf/2402.18563, p28
  return `
I will provide you with a forecasting question and the background information for the question. I will then ask you to generate short search queries (up to ${maxWords}) that I’ll use to find articles on Google News to help answer the question.

Question: ${question}
Background: ${background}

You must generate this exact amount of queries: ${maxWords}

Start off by writing down sub-questions. Then use your sub-questions to help steer the search queries you produce.

Your response should take the following structure: Thoughts: {{ Insert your thinking here. }}
Search Queries: {{ Insert the queries here. Use semicolons to separate the queries. }}
`
}

export const formatQuery = (query: string): string => {
  let trimmedQuery = query
    .trim()
    .replace(/\.$/, '') // Remove periods.
    .replace(/^[^a-zA-Z"']+/, '') // Remove stuff before the start of the query.

  const quoteCount = (trimmedQuery.match(/["']/g) || []).length
  if (quoteCount === 2) {
    // Remove wrapping quotes.
    trimmedQuery = trimmedQuery.replace(/^(["'])(.*)(\1)$/, '$2')
  }

  return trimmedQuery
}

const destructureLLMResponse = (
  llmText: string
): {
  queries: string[]
  reasoning: string
} => {
  let queries = []
  let reasoning = ''
  const separator = "Search Queries:"

  if (!llmText.includes(separator)) {
    reasoning = `Misformatted response ${llmText}`
    console.log(reasoning)
  }

  const [rawReasoning, rawQueries] = llmText.split(separator)

  reasoning = rawReasoning

  queries = rawQueries.trim()
    .split(/;\n?/) // Split queries at semi-colons w/ optional newlines
    .map(q => formatQuery(q))
    .filter(q => q.length > 5)

  return {
    queries,
    reasoning,
  }
}

export const generateNewsQueries = async (query: ForecastQuery): Promise<NewsQueries> => {
  // Prompt GPT4 with both prompts to get queries and reasons.
  const promptA = buildPromptA(query.question, query.background)
  const promptB = buildPromptB(query.question, query.background)

  const resultsA = await promptGPT4(promptA)
  const resultsB = await promptGPT4(promptB)

  const {queries: queriesA, reasoning: reasonA} = destructureLLMResponse(resultsA)
  const {queries: queriesB, reasoning: reasonB} = destructureLLMResponse(resultsB)

  return {
    queries: [...queriesA, ...queriesB],
    reasons: [reasonA, reasonB]
  }
}
