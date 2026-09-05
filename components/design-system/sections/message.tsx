import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function MessageDemo() {
  return (
    <div className="flex max-w-md flex-col gap-6">
      <MessageGroup>
        <Message align="start">
          <MessageAvatar>
            <Avatar size="sm">
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Aria · 9:41 AM</MessageHeader>
            <Bubble align="start" variant="muted">
              <BubbleContent>
                Got the pastry order in for tomorrow morning.
              </BubbleContent>
            </Bubble>
            <MessageFooter>Delivered</MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>

      <MessageGroup>
        <Message align="end">
          <MessageContent>
            <MessageHeader>You · 9:42 AM</MessageHeader>
            <Bubble align="end" variant="default">
              <BubbleContent>
                Perfect, thank you! Let&apos;s add extra croissants.
              </BubbleContent>
            </Bubble>
            <MessageFooter>Seen · 9:43 AM</MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
    </div>
  )
}
