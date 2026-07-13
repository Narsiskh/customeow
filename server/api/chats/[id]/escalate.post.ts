import { z } from 'zod'
import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    description: 'Escalate a chat to a human support agent.',
    tags: ['support']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string() }).parse)
  const { reason } = await readValidatedBody(event, z.object({
    reason: z.string().max(500).optional()
  }).parse).catch(() => ({ reason: undefined }))

  const ownerId = session.user?.id || session.id

  const chat = await db.query.chats.findFirst({
    where: () => and(eq(schema.chats.id, id), eq(schema.chats.userId, ownerId))
  })

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  // Ownership check passes for guests too — but escalating requires a real account
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Please sign in to talk to a human agent' })
  }

  if (chat.status === 'pending') {
    return { status: chat.status, alreadyEscalated: true }
  }

  await db.update(schema.chats).set({ status: 'pending' }).where(eq(schema.chats.id, chat.id))

  const [escalation] = await db.insert(schema.escalations).values({
    chatId: chat.id,
    requestedBy: session.user.id,
    reason
  }).returning()

  await db.insert(schema.messages).values({
    id: crypto.randomUUID(),
    chatId: chat.id,
    role: 'system',
    parts: [{ type: 'text', text: reason ? `Customer requested a human agent: "${reason}"` : 'Customer requested a human agent.' }]
  })

  return { status: 'pending', escalationId: escalation?.id }
})
