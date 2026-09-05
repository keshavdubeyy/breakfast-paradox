import { Badge } from "@/components/ui/badge"

export default function BadgeDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
        <Badge variant="link">Link</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Draft</Badge>
        <Badge>In progress</Badge>
        <Badge variant="outline">Backlog</Badge>
        <Badge variant="destructive">Blocked</Badge>
      </div>
    </div>
  )
}
