import type {
  ChatMessageType,
  MessageDirection,
  MessageStatus,
  PatientRequestType,
  UserStatus
} from './enums'

export type User = {
  id: string,
  name: string,
  imageUri?: string | null,
  status: UserStatus,
}

export type MessagePreview = {
  id: string,
  preview: string,
  time: Date,
  direction: MessageDirection,
  status: MessageStatus,
}

export type ConversationPreview = {
  id: string,
  user: User,
  lastMessage: MessagePreview,
  unreadCount: number,
}

export interface MessageBase {
  id: string,
  type: ChatMessageType,
  time: Date,
  direction: MessageDirection,
  status: MessageStatus,
}

export interface TextMessage extends MessageBase {
  type: Extract<ChatMessageType, 'text'>,
  body: string,
}

export type DateDividerMessage = {
  id: string,
  type: Extract<ChatMessageType, 'date'>,
  date: Date,
}

export type SystemMessage = {
  id: string,
  type: Extract<ChatMessageType, 'system'>,
  body: string,
}

export interface StructuredCardMessage extends MessageBase {
  type: Extract<ChatMessageType, 'card'>,
  kind: PatientRequestType,
  title: string,
  subtitle: string,
  primary: string,
  detail: string,
  requestId?: string,
  mainActionId?: string,
  selectedActionId?: string,
  actions?: {
    id: string,
    label: string,
  }[],
}

export type AttachmentMessage = MessageBase & {
  type: Extract<ChatMessageType, 'attachment'>,
  fileName: string,
  fileType: string,
  fileSize: string,
}

export type Message =
  | TextMessage
  | DateDividerMessage
  | SystemMessage
  | StructuredCardMessage
  | AttachmentMessage
