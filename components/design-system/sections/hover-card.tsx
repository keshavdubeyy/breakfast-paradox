"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function HoverCardDemo() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Hover (or focus) a trigger below to preview a profile card without
        leaving the page.
      </p>
      <div className="flex flex-wrap items-center gap-8">
        <p className="text-sm">
          Reviewed by{" "}
          <HoverCard>
            <HoverCardTrigger
              href="#"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              @sarahchen
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="flex gap-3">
                <Avatar size="lg">
                  <AvatarImage
                    src="https://i.pravatar.cc/80?img=47"
                    alt="Sarah Chen"
                  />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-popover-foreground">
                    Sarah Chen
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Product designer building calm, human software.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined March 2021
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>{" "}
          two days ago.
        </p>

        <HoverCard>
          <HoverCardTrigger
            href="#"
            className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Avatar>
              <AvatarImage
                src="https://i.pravatar.cc/80?img=12"
                alt="Marcus Lee"
              />
              <AvatarFallback>ML</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Marcus Lee</span>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex items-start gap-3">
              <Avatar size="lg">
                <AvatarImage
                  src="https://i.pravatar.cc/80?img=12"
                  alt="Marcus Lee"
                />
                <AvatarFallback>ML</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-popover-foreground">
                    Marcus Lee
                  </p>
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    className="size-3.5 text-muted-foreground"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Backend engineer working on distributed systems.
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined August 2019
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  )
}
