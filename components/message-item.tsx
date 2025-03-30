import { cn } from "@/lib/utils"

type MessageType = "user" | "system" | "assistant"

interface Message {
  type: MessageType
  content: string
  timestamp?: string
  author?: string
}

export function MessageItem({ message }: { message: Message }) {
  return (
    <div
      className={cn(
        "rounded-lg p-4",
        message.type === "user" && "bg-blue/10",
        message.type === "assistant" && "bg-yellow/10",
        message.type === "system" && "bg-navy/5",
      )}
    >
      {message.author && (
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
              message.type === "user" && "bg-blue text-cream",
              message.type === "assistant" && "bg-navy text-cream",
              message.type === "system" && "bg-yellow text-navy",
            )}
          >
            {message.author.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-navy">{message.author}</span>
          {message.timestamp && <span className="text-xs text-navy/60">{message.timestamp}</span>}
        </div>
      )}
      <div className="text-sm whitespace-pre-wrap text-navy/80">{message.content}</div>
    </div>
  )
}

