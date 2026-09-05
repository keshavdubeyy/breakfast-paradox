"use client"

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { File01Icon, Image01Icon } from "@hugeicons/core-free-icons"

export default function MessageScrollerDemo() {
  return (
    <div className="h-[420px] overflow-hidden rounded-lg border">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem>
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
                          Morning! Here&apos;s the pastry inventory for today.
                        </BubbleContent>
                      </Bubble>
                      <Attachment size="sm" className="max-w-64">
                        <AttachmentMedia variant="icon">
                          <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>inventory.pdf</AttachmentTitle>
                          <AttachmentDescription>184 KB</AttachmentDescription>
                        </AttachmentContent>
                      </Attachment>
                    </MessageContent>
                  </Message>
                </MessageGroup>
              </MessageScrollerItem>

              <MessageScrollerItem>
                <MessageGroup>
                  <Message align="end">
                    <MessageContent>
                      <Bubble align="end" variant="default">
                        <BubbleContent>
                          Great, thanks! I&apos;ll check it before opening.
                        </BubbleContent>
                      </Bubble>
                      <MessageFooter>Seen · 9:43 AM</MessageFooter>
                    </MessageContent>
                  </Message>
                </MessageGroup>
              </MessageScrollerItem>

              <MessageScrollerItem>
                <MessageGroup>
                  <Message align="start">
                    <MessageAvatar>
                      <Avatar size="sm">
                        <AvatarFallback>AR</AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent>
                      <Bubble align="start" variant="muted">
                        <BubbleContent>
                          Also heads up, we&apos;re running low on almond flour.
                        </BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageGroup>
              </MessageScrollerItem>

              <MessageScrollerItem>
                <MessageGroup>
                  <Message align="end">
                    <MessageContent>
                      <Bubble align="end" variant="default">
                        <BubbleContent>
                          Got it — I&apos;ll reorder this afternoon.
                        </BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageGroup>
              </MessageScrollerItem>

              <MessageScrollerItem scrollAnchor>
                <MessageGroup>
                  <Message align="start">
                    <MessageAvatar>
                      <Avatar size="sm">
                        <AvatarFallback>AR</AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent>
                      <Bubble align="start" variant="muted">
                        <BubbleContent>
                          Here&apos;s a snap of the display case 🍩
                        </BubbleContent>
                      </Bubble>
                      <Attachment size="sm" className="max-w-64">
                        <AttachmentMedia variant="icon">
                          <HugeiconsIcon icon={Image01Icon} strokeWidth={2} />
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>display-case.png</AttachmentTitle>
                          <AttachmentDescription>1.1 MB</AttachmentDescription>
                        </AttachmentContent>
                      </Attachment>
                      <MessageFooter>9:47 AM</MessageFooter>
                    </MessageContent>
                  </Message>
                </MessageGroup>
              </MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  )
}
