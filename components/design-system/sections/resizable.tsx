"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function ResizableDemo() {
  return (
    <div className="h-[240px] w-full overflow-hidden rounded-lg border">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="35" minSize="20">
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
            Menu categories
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="65" minSize="30">
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
            Breakfast specials preview
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
