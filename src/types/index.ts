export interface ForecastQuery {
  question: string
  background: string
  resolutionCriteria: string
  beginDate: Date
  closeDate: Date
}

export interface NewsQueries {
  queries: string[] // The queries to be used with the news APIs.
  reasons: string[] // The LLM's reasons for choosing the queries.
}

export enum NewsSource {
  Google = 'google',
  NewsCatcher = 'newsCatcher'
}

export interface NewsArticle {
  title: string
  authors: string[]
  link: string
  content: string
  published: string
  retrievedBy: NewsSource
  relevance?: number
}

export interface Prediction {
  probability: number
  explanation: string
  source: string
}

export interface PredictionOutput {
  query: ForecastQuery
  probability: number
  predictions: Prediction[]
  newsQueries: string[]
  newsQueryReasons: string[]
  newsArticles: NewsArticle[] // All of the articles we've pulled.
  rankedArticles: NewsArticle[] // The most relevant articles, with relevance ratings.
  summarizedArticles: string[]
}
