import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineNitroPlugin(async () => {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.warn('[seed-admin] ADMIN_EMAIL / ADMIN_PASSWORD not set in env — skipping admin seed')
    return
  }

  const normalizedEmail = email.toLowerCase()

  const existing = await db.query.users.findFirst({
    where: () => eq(schema.users.email, normalizedEmail)
  })

  if (existing) {
    if (existing.role !== 'admin') {
      await db.update(schema.users).set({ role: 'admin' }).where(eq(schema.users.id, existing.id))
      console.log(`[seed-admin] Promoted existing user ${normalizedEmail} to admin`)
    }
    return
  }

  const passwordHash = await hashPassword(password)

  await db.insert(schema.users).values({
    email: normalizedEmail,
    name: 'Admin',
    username: 'admin',
    passwordHash,
    role: 'admin',
    provider: 'credentials',
    providerId: normalizedEmail
  })

  console.log(`[seed-admin] Created admin user: ${normalizedEmail}`)
})
