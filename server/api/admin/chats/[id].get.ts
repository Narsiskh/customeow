import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string() }).parse)

  const chat = await db.query.chats.findFirst({
    where: () => eq(schema.chats.id, id),
    with: { messages: true }
  })

  if (!chat) throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  return chat
})
