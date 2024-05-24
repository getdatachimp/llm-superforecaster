import axios from 'axios'

import type { NewsArticle } from '../types'
import { NewsSource } from '../types'

import APIConcurrencyQueue from './apiConcurrencyQueue'

const newsCatcherPool = new APIConcurrencyQueue({
  maxConnections: 2,
  buffer: 2_000,
})

interface NewsCatcherArticle {
  title: string
  author: string | null
  content: string
  published_date: string
  published_date_precision: string
  link: string
  clean_url: string
  excerpt: string
  summary: string
  rights: string
  rank: number
  topic: string
  country: string
  language: string
  authors: string[]
  media: string
  is_opinion: boolean
  twitter_account: string | null
  _score: number
  _id: string
}

interface NewsCatcherResponse {
  status: string
  total_hits: number
  page: number
  total_pages: number
  page_size: number
  articles: Array<NewsCatcherArticle>
}

const NEWSCATCHER_API_URL = 'https://v3-api.newscatcherapi.com'

const convertToNewsArticle = (article: NewsCatcherArticle): NewsArticle => {
  const { title, authors, content, link, published_date } = article
  return {
    title,
    authors,
    content,
    link,
    published: published_date,
    retrievedBy: NewsSource.NewsCatcher,
  }
}

export const searchNewsCatcher = async (
  query: string,
  maxArticles: number = 10,
  retries: number = 0,
): Promise<Array<NewsArticle>> => {
  const newsRequest = async () => {
    const headers = { 'x-api-token': process.env.NEWSCATCHER_API_KEY }
    // https://docs.newscatcherapi.com/api-docs/endpoints-1/search-news
    const response = await axios.get<NewsCatcherResponse>(
      `${NEWSCATCHER_API_URL}/api/search?`, {
        headers,
        params: {
          q: query,
          lang: 'en',
          sort_by: 'relevancy',
          from_: '90 days ago',
          // to_: 'today', // this is the default
        }
      }
    )

    const responseArticles = response.data.articles.slice(0, maxArticles)
    const newsArticles = responseArticles.map(a => convertToNewsArticle(a))
    console.log(`Found ${newsArticles.length} articles via NewsCatcher`)
    return newsArticles
  }

  return newsCatcherPool.queueWithRetries({
    task: newsRequest,
    name: `search NewsCatcher for "${query}"`,
    maxRetries: 2,
    backoffDuration: 1_000,
  })
}
