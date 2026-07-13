import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  // swap for your real KB query
  const articles = await db.select({
    id: schema.kbArticles.id,
    slug: schema.kbArticles.slug,
    title: schema.kbArticles.title
  })
    .from(schema.kbArticles)
    .orderBy(desc(schema.kbArticles.viewCount))
    .limit(4)

  return articles
})
