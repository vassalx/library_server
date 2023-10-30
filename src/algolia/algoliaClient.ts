import algoliasearch from 'algoliasearch'

const AlgoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID || '',
  process.env.ALGOLIA_API_KEY || '',
)

export default AlgoliaClient
