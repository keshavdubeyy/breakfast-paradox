"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  InboxIcon,
  Calendar03Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

const navMain = [
  { title: "Home", icon: Home01Icon, isActive: true },
  { title: "Inbox", icon: InboxIcon, isActive: false },
  { title: "Calendar", icon: Calendar03Icon, isActive: false },
]

const navSettings = [
  { title: "Settings", icon: Settings01Icon, isActive: false },
]

export default function SidebarDemo() {
  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-lg border">
      <SidebarProvider
        className="h-full min-h-0"
        style={{ ["--sidebar-width" as string]: "16rem" }}
      >
        <Sidebar collapsible="icon" className="absolute h-full">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <HugeiconsIcon
                  icon={Home01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </div>
              <span className="text-sm font-medium">Acme Inc</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navMain.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={item.isActive}
                        tooltip={item.title}
                      >
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navSettings.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={item.isActive}
                        tooltip={item.title}
                      >
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Ada Lovelace">
                  <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                  <span>Ada Lovelace</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center gap-2 border-b p-3">
            <SidebarTrigger />
            <span className="text-sm font-medium text-muted-foreground">
              Dashboard
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="h-20 rounded-lg bg-muted" />
            <div className="h-20 rounded-lg bg-muted" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
