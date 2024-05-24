import type { NewsArticle } from '../types'
import { searchNewsCatcher } from './newsCatcher'

export const searchNewsSourcesFor = async (
  queries: string[]
): Promise<Array<NewsArticle>> => {
  let searchResults = []
  for (const query of queries) {
    const articles = await _searchNewsSourcesFor(query)
    searchResults.push(...articles)
  }

  // Dedup articles by title.
  const uniqueTitles = new Set<string>()
  const uniqueResults = searchResults.filter(article => {
    const title = article.title.toLowerCase()
    const isDuplicate = uniqueTitles.has(title)
    uniqueTitles.add(title)
    return !isDuplicate
  })

  return uniqueResults
}

const _searchNewsSourcesFor = async (
  query: string
): Promise<Array<NewsArticle>> => {
  try {
    return searchNewsCatcher(query)
  } catch (error) {
    console.log("Error fetching news articles", error)
    return []
  }
}
