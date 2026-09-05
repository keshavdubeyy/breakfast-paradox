import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"

export default function AvatarDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar size="sm">
          <AvatarFallback>JK</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>MR</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>SB</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>DL</AvatarFallback>
          <AvatarBadge />
        </Avatar>
      </div>

      <AvatarGroup>
        <Avatar>
          <AvatarFallback>AA</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>BB</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>CC</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+5</AvatarGroupCount>
      </AvatarGroup>
    </div>
  )
}
