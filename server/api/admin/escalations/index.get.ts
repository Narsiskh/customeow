import { desc, inArray } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const escalations = await db.query.escalations.findMany({
    where: () => inArray(schema.escalations.status, ['pending', 'claimed']),
    orderBy: () => desc(schema.escalations.createdAt),
    with: {
      chat: { with: { user: true } }
    }
  })

  return escalations.map(e => ({
    id: e.id,
    chatId: e.chatId,
    chatTitle: e.chat?.title || 'Untitled',
    customerName: e.chat?.user?.name || e.chat?.user?.username || 'Guest',
    reason: e.reason,
    status: e.status,
    createdAt: e.createdAt
  }))
})
