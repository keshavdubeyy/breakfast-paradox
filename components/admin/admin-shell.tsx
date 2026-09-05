"use client"

import { useEffect, useRef, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  Brain01Icon,
  Layers01Icon,
  LayoutDashboardIcon,
  TrendingUpIcon,
} from "@hugeicons/core-free-icons"

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
  useSidebar,
} from "@/components/ui/sidebar"

// A tablet-width viewport (roughly 768-1100px) gets the full 256px
// sidebar treated as "desktop" today — there's no automatic collapse
// between the mobile overlay and the full desktop width. This nudges a
// tablet-sized viewport to start icon-collapsed (still fully togglable
// by the user afterwards) so dense Patterns/Events tables get more room
// instead of being squeezed into what's left after a fixed-width
// sidebar. Runs once on mount only — it must never fight a user's own
// toggle on a later resize.
const TABLET_MAX_WIDTH = 1100

function TabletAutoCollapse() {
  const { isMobile, setOpen } = useSidebar()
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current || isMobile) return
    didRun.current = true
    if (window.innerWidth < TABLET_MAX_WIDTH) {
      setOpen(false)
    }
  }, [isMobile, setOpen])

  return null
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { logout } from "@/app/admin/login/actions"

const CONTRIBUTORS = ["Keshav Dubey", "Aasritha Kalluri", "Rahul Chand"]

// The iceberg model this dashboard is organized around — Overview,
// Events, and Patterns are built so far; the rest are listed (disabled)
// so the intended shape of the whole dashboard is visible from day one,
// not just from documentation.
const NAV_ITEMS = [
  { title: "Overview", href: "/admin/overview", icon: LayoutDashboardIcon },
  { title: "Events", href: "/admin/events", icon: Activity01Icon },
  { title: "Patterns", href: "/admin/patterns", icon: TrendingUpIcon },
  { title: "Structures", href: "/admin/structures", icon: Layers01Icon, disabled: true },
  { title: "Mental Models", href: "/admin/mental-models", icon: Brain01Icon, disabled: true },
]

interface AdminShellProps {
  children: ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <TabletAutoCollapse />
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="text-sm font-medium">Breakfast Paradox</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      aria-disabled={item.disabled}
                      // Not the native `disabled` prop: SidebarMenuButton
                      // wraps a disabled item in a TooltipTrigger (since
                      // `tooltip` is set below), and that wrapper consumes
                      // `disabled` for its own open/close logic rather
                      // than forwarding it to the underlying button — so
                      // the visual/interactive disabling is done by hand
                      // here instead.
                      className={
                        item.disabled ? "pointer-events-none opacity-50" : undefined
                      }
                      tooltip={item.disabled ? `${item.title} (coming soon)` : item.title}
                      render={
                        item.disabled ? undefined : <Link href={item.href} />
                      }
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
          <Card size="sm" className="group-data-[collapsible=icon]:hidden">
            <CardHeader>
              <CardTitle className="text-xs text-muted-foreground uppercase">
                Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm text-foreground">
              {CONTRIBUTORS.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </CardContent>
          </Card>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void logout()
            }}
          >
            Log out
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">
            Survey analytics, internal only
          </span>
        </header>
        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
