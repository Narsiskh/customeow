import { z } from 'zod'
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)
  const normalizedEmail = email.toLowerCase()

  const user = await db.query.users.findFirst({
    where: () => eq(schema.users.email, normalizedEmail)
  })

  // Same message for "no user" and "wrong password" — don't leak which one it was
  if (!user || !user.passwordHash) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const valid = await verifyPassword(user.passwordHash, password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
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
