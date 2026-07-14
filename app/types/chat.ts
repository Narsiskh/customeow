import type { UIMessage } from 'ai'

export interface AppMessageMetadata {
  isAgentReply?: boolean
}

export type AppUIMessage = UIMessage<AppMessageMetadata>
