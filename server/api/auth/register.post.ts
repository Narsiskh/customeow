import { z } from 'zod'
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

const bodySchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72)
})

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readValidatedBody(event, bodySchema.parse)
  const normalizedEmail = email.toLowerCase()

  const existing = await db.query.users.findFirst({
    where: () => eq(schema.users.email, normalizedEmail)
  })

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists' })
  }

  const passwordHash = await hashPassword(password)

  const [user] = await db.insert(schema.users).values({
    email: normalizedEmail,
    name,
    username: normalizedEmail.split('@')[0] ?? normalizedEmail,
    passwordHash,
    role: 'customer',
    provider: 'credentials',
    providerId: normalizedEmail
  }).returning()

  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create account' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar ?? undefined,
      role: user.role
    }
  })

  return { id: user.id }
})
