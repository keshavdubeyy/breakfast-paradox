"use client"

import { ScrollArea } from "@/components/ui/scroll-area"

const menuItems = [
  "Buttermilk pancakes",
  "Belgian waffles",
  "Classic French toast",
  "Cheese omelette",
  "Denver omelette",
  "Eggs Benedict",
  "Avocado toast",
  "Breakfast burrito",
  "Steel-cut oatmeal",
  "Granola parfait",
  "Cinnamon roll",
  "Blueberry muffin",
  "Bacon strips",
  "Sausage links",
  "Hash browns",
  "Home fries",
  "Fresh fruit bowl",
  "Yogurt with honey",
  "Fresh orange juice",
  "Drip coffee",
]

export default function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-72 w-64 rounded-lg border">
      <div className="flex flex-col p-4">
        {menuItems.map((item, index) => (
          <div key={item} className="py-1.5 text-sm">
            {index + 1}. {item}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
