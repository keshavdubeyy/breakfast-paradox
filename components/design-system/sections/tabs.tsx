"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function TabsDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="account" className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="flex flex-col gap-3 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tabs-demo-name">Name</Label>
            <Input id="tabs-demo-name" defaultValue="Ada Lovelace" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tabs-demo-username">Username</Label>
            <Input id="tabs-demo-username" defaultValue="@ada" />
          </div>
        </TabsContent>
        <TabsContent value="password" className="flex flex-col gap-3 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tabs-demo-current">Current password</Label>
            <Input id="tabs-demo-current" type="password" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tabs-demo-new">New password</Label>
            <Input id="tabs-demo-new" type="password" />
          </div>
        </TabsContent>
        <TabsContent
          value="notifications"
          className="flex flex-col gap-2 pt-2 text-sm text-muted-foreground"
        >
          <p>Choose what you want to be notified about.</p>
          <p>Email digests are sent every Monday at 9am.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
