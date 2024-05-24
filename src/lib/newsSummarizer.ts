import { ForecastQuery, NewsArticle } from '../types'
import { promptGPT3Turbo } from './openAi'

const buildSummarizationPrompt = ({
  query,
  article,
}: {
  query: ForecastQuery
  article: NewsArticle
}): string => {
  // https://arxiv.org/pdf/2402.18563, p28
  return `
I want to make the following article shorter (condense it to no more than 100 words).

Article:
Title: ${article.title}
Content: ${article.content}

When doing this task for me, please do not remove any details that would be helpful for making considerations about the following forecasting question.

Forecasting Question: ${query.question}
Question Background: ${query.background}
`
}

const summarizeArticle = async ({
  query,
  article,
}: {
  query: ForecastQuery
  article: NewsArticle
}): Promise<string> => {
  const prompt = buildSummarizationPrompt({ query, article })
  return promptGPT3Turbo(prompt)
}

export const summarizeNewsArticles = async ({
  query,
  articles,
}: {
  query: ForecastQuery
  articles: Array<NewsArticle>
}): Promise<Array<string>> => {
  console.log("Summarizing articles... (this may take a while)")
  return Promise.all(
    articles.map(article => summarizeArticle({ query, article }))
  )
}
