import { sqliteTable, text, integer, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
}

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'), // now nullable — credentials users won't have one
  username: text('username').notNull(),
  passwordHash: text('password_hash'), // null for OAuth-only users
  role: text('role', { enum: ['customer', 'agent', 'admin'] }).notNull().default('customer'),
  provider: text('provider', { enum: ['github', 'credentials'] }).notNull(),
  providerId: text('provider_id').notNull(),
  ...timestamps
}, table => [
  uniqueIndex('users_provider_id_idx').on(table.provider, table.providerId),
  uniqueIndex('users_email_idx').on(table.email)
])

export const chats = sqliteTable('chats', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title'),
  userId: text('user_id').notNull(),
  visibility: text('visibility', { enum: ['public', 'private'] }).notNull().default('private'),
  status: text('status', { enum: ['open', 'pending', 'resolved'] }).notNull().default('open'),
  ...timestamps
}, table => [
  index('chats_user_id_idx').on(table.userId),
  index('chats_status_idx').on(table.status)
])

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id]
  }),
  messages: many(messages)
}))

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  parts: text('parts', { mode: 'json' }),
  isAgentReply: integer('is_agent_reply', { mode: 'boolean' }).notNull().default(false),
  ...timestamps
}, table => [
  index('messages_chat_id_idx').on(table.chatId)
])

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id]
  })
}))

export const votes = sqliteTable('votes', {
  chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  messageId: text('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  isUpvoted: integer('is_upvoted', { mode: 'boolean' }).notNull()
}, table => [
  primaryKey({ columns: [table.chatId, table.messageId] })
])

export const votesRelations = relations(votes, ({ one }) => ({
  chat: one(chats, {
    fields: [votes.chatId],
    references: [chats.id]
  }),
  message: one(messages, {
    fields: [votes.messageId],
    references: [messages.id]
  })
}))

export const escalations = sqliteTable('escalations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  requestedBy: text('requested_by').notNull(),
  reason: text('reason'),
  assignedAgentId: text('assigned_agent_id'),
  status: text('status', { enum: ['pending', 'claimed', 'resolved'] }).notNull().default('pending'),
  ...timestamps
}, table => [
  index('escalations_chat_id_idx').on(table.chatId),
  index('escalations_status_idx').on(table.status)
])

export const escalationsRelations = relations(escalations, ({ one }) => ({
  chat: one(chats, {
    fields: [escalations.chatId],
    references: [chats.id]
  })
}))
