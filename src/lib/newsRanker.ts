import { ForecastQuery, NewsArticle } from '../types'
import { promptGPT3Turbo } from './openAi'

const buildRelevanceRankingPrompt = ({
  query,
  article,
}: {
  query: ForecastQuery
  article: NewsArticle
}): string => {
  // "[W]e only present the article’s title and first 250 words to the model in
  // context. We validate that this approach achieves high recall and precision
  // while saving 70% cost[.]" p6, https://arxiv.org/pdf/2402.18563
  const trimmedContent = article.content.split(/\s+/).slice(0, 250).join(' ')

  // https://arxiv.org/pdf/2402.18563, p29
  return `
Please consider the following forecasting question and its background information. After that, I will give you a news article and ask you to rate its relevance with respect to the forecasting question.

Question: ${query.question}
Question Background: ${query.background}
Resolution Criteria: ${query.resolutionCriteria}

Article:
${article.title}
${trimmedContent}

Please rate the relevance of the article to the question, on a scale of 1-6
1 – irrelevant
2 – slightly relevant
3 – somewhat relevant
4 – relevant
5 – highly relevant
6 – most relevant

Guidelines:
- You don’t need to access any external sources. Just consider the information provided.
- Focus on the Content of the ARTICLE, not the Title.
- If the text content is an error message about JavaScript, paywall, cookies or other technical issues, output a score of 1.

Your response should look like the following:
Thought: {{ Insert your thinking }}
Rating: {{ Insert answer here }}
`
}

const destructureLLMResponse = (llmText: string): number => {
  const separator = "Rating:"

  if (!llmText.includes(separator)) {
    console.log(`Misformatted response ${llmText}`)
    return 1 // Irrelevant.
  }

  const [_reason, rating] = llmText.split(/Rating:\s?/)
  return Number(rating.replace(/\D/g, ''))
}

const assessArticleRelevance = async ({
  query,
  article,
}: {
  query: ForecastQuery
  article: NewsArticle
}): Promise<NewsArticle> => {
  const prompt = buildRelevanceRankingPrompt({ query, article })
  const response = await promptGPT3Turbo(prompt)
  const rating = destructureLLMResponse(response)
  article.relevance = rating
  return article
}

export const rankArticlesForRelevance = async ({
  query,
  articles,
  // "Ranking by relevance and setting k = 15 achieve the lowest average Brier score."
  // p9, https://arxiv.org/pdf/2402.18563.pdf
  maxRelevantArticles = 15,
}: {
  query: ForecastQuery
  articles: Array<NewsArticle>
  maxRelevantArticles?: number
}): Promise<Array<NewsArticle>> => {
  const ratedArticles = await Promise.all(
    articles.map(article => assessArticleRelevance({ query, article }))
  )
  return ratedArticles.sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxRelevantArticles)
}
