import { ForecastQuery, PredictionOutput } from '../types'
import { generateNewsQueries } from './newsQueryGenerator'
import { searchNewsSourcesFor } from './newsAPIService'
import { rankArticlesForRelevance } from './newsRanker'
import { summarizeNewsArticles } from './newsSummarizer'
import { generateGPT4Prediction } from './gptPredictor'

export const forecast = async (query: ForecastQuery): Promise<PredictionOutput> => {
  // Generate news queries based on question.
  const {
    queries: newsQueries,
    reasons: newsQueryReasons,
  } = await generateNewsQueries(query)

  // Call news APIs for each of the queries.
  const newsArticles = await searchNewsSourcesFor(newsQueries)

  // Rank articles based on relevance to the query.
  const rankedArticles = await rankArticlesForRelevance({
    query,
    articles: newsArticles,
  })

  // Summarize ranked articles so they can be reasoned with.
  const summaries = await summarizeNewsArticles({
    query,
    articles: rankedArticles,
  })

  // Make predictions.
  const predictions = await Promise.all([
    generateGPT4Prediction({ query, summaries }),
    generateGPT4Prediction({ query, summaries }),
  ])

  // Aggregate predictions.
  const probability = predictions.reduce(
    (acc, p) => acc + p.probability, 0
  ) / predictions.length

  console.log("Final probability:", probability)

  return {
    query,
    probability,
    predictions,
    newsQueries,
    newsQueryReasons,
    newsArticles,
    rankedArticles,
    summarizedArticles: summaries,
  }
}
