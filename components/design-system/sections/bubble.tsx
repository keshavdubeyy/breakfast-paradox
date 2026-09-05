import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"

export default function BubbleDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Bubble align="start" variant="muted">
        <BubbleContent>Hey, are we still on for coffee tomorrow?</BubbleContent>
      </Bubble>

      <Bubble align="end" variant="default">
        <BubbleContent>Yes! 10am at the usual spot works for me.</BubbleContent>
      </Bubble>

      <Bubble align="start" variant="secondary">
        <BubbleContent>
          Loved the new breakfast menu, by the way 🥞
        </BubbleContent>
        <BubbleReactions>❤️ 2</BubbleReactions>
      </Bubble>
    </div>
  )
}
