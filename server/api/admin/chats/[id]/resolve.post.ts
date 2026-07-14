import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string() }).parse)

  await db.update(schema.chats).set({ status: 'resolved' }).where(eq(schema.chats.id, id))

  const escalation = await db.query.escalations.findFirst({ where: () => eq(schema.escalations.chatId, id) })
  if (escalation) {
    await db.update(schema.escalations).set({ status: 'resolved' }).where(eq(schema.escalations.id, escalation.id))
  }

  return { status: 'resolved' }
})
