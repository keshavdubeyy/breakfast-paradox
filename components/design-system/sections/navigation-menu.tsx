import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export default function NavigationMenuDemo() {
  return (
    <div className="flex flex-col gap-6">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[320px] gap-1">
                <li>
                  <NavigationMenuLink
                    href="#"
                    className="flex-col items-start gap-0.5"
                  >
                    <span className="font-medium">Breakfast Classics</span>
                    <span className="text-xs text-muted-foreground">
                      Pancakes, waffles, and eggs any style.
                    </span>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    href="#"
                    className="flex-col items-start gap-0.5"
                  >
                    <span className="font-medium">Pastries</span>
                    <span className="text-xs text-muted-foreground">
                      Fresh croissants and baked goods daily.
                    </span>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    href="#"
                    className="flex-col items-start gap-0.5"
                  >
                    <span className="font-medium">Coffee & Drinks</span>
                    <span className="text-xs text-muted-foreground">
                      Espresso, cold brew, and seasonal drinks.
                    </span>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Locations</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[280px] gap-1">
                <li>
                  <NavigationMenuLink
                    href="#"
                    className="flex-col items-start gap-0.5"
                  >
                    <span className="font-medium">Downtown</span>
                    <span className="text-xs text-muted-foreground">
                      Open daily, 7am – 3pm.
                    </span>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    href="#"
                    className="flex-col items-start gap-0.5"
                  >
                    <span className="font-medium">Riverside</span>
                    <span className="text-xs text-muted-foreground">
                      Open daily, 8am – 2pm.
                    </span>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink href="#">Catering</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
