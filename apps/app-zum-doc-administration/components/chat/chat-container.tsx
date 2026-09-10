import type { PropsWithChildren } from 'react'

export function ChatContainer({ children }: PropsWithChildren) {
  return (
    <div className="h-full min-h-0 pb-4">
      <div className="chat-container">
        {children}
      </div>
    </div>
  )
}
