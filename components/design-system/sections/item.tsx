import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Alert02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"

import {
  ItemGroup,
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemSeparator,
} from "@/components/ui/item"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function ItemDemo() {
  return (
    <ItemGroup className="max-w-md">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            className="text-primary"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Payment received</ItemTitle>
          <ItemDescription>
            Invoice #1042 from Acme Roasters was paid in full.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </ItemActions>
      </Item>

      <ItemSeparator />

      <Item variant="outline">
        <ItemMedia variant="image">
          <Avatar>
            <AvatarImage
              src="https://i.pravatar.cc/80?img=47"
              alt="Sarah Chen"
            />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Sarah Chen requested access</ItemTitle>
          <ItemDescription>
            Wants to join the &quot;Design System&quot; workspace as an editor.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Decline
          </Button>
          <Button size="sm">Approve</Button>
        </ItemActions>
      </Item>

      <ItemSeparator />

      <Item variant="outline">
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={Alert02Icon} className="text-destructive" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Storage almost full</ItemTitle>
          <ItemDescription>
            You&apos;ve used 92% of your 10 GB plan. Upgrade to avoid
            interruptions.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon-sm" aria-label="More info">
            <HugeiconsIcon icon={InformationCircleIcon} />
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  )
}
