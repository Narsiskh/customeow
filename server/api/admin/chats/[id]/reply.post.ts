import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string() }).parse)
  const { text } = await readValidatedBody(event, z.object({ text: z.string().min(1).max(4000) }).parse)

  const chat = await db.query.chats.findFirst({ where: () => eq(schema.chats.id, id) })
  if (!chat) throw createError({ statusCode: 404, statusMessage: 'Chat not found' })

  const [message] = await db.insert(schema.messages).values({
    id: crypto.randomUUID(),
    chatId: chat.id,
    role: 'assistant',
    parts: [{ type: 'text', text }],
    isAgentReply: true
  }).returning()

  console.log(`[admin-reply] ${admin.name} replied to chat ${chat.id}`)
  return message
})
