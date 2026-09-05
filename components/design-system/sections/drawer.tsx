"use client"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

export default function DrawerDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Drawer>
        <DrawerTrigger
          render={<Button variant="outline">Open drawer</Button>}
        />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notification settings</DrawerTitle>
            <DrawerDescription>
              Choose how you&apos;d like to be notified about activity on this
              project.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose render={<Button>Done</Button>} />
            <DrawerClose render={<Button variant="outline">Cancel</Button>} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
