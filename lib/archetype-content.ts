// Presentation content for the six archetypes — kept separate from the
// scoring logic so copy edits never touch the calculation code. The
// result UI (components/survey/result-page.tsx) is entirely data-driven
// from ARCHETYPES: it never hardcodes a name, description, trait, or
// closing line for any archetype.

export type ArchetypeId =
  | "routine-keeper"
  | "sleep-saver"
  | "schedule-juggler"
  | "flexible-switcher"
  | "alternative-forager"
  | "meal-maximizer"

export const ARCHETYPE_IDS: ArchetypeId[] = [
  "routine-keeper",
  "sleep-saver",
  "schedule-juggler",
  "flexible-switcher",
  "alternative-forager",
  "meal-maximizer",
]

export interface ArchetypeInfo {
  id: ArchetypeId
  /** Display name, e.g. "The Routine Keeper". */
  name: string
  /** One short line under the name. */
  tagline: string
  /** The 1-2 sentence description shown on the result card. */
  description: string
  /** 3-4 short, human-readable behavior traits — not AI-generated at
   * render time; these are fixed editorial copy per archetype. */
  traits: string[]
  /** A short closing line shown after the traits. */
  closingNote: string
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeInfo> = {
  "routine-keeper": {
    id: "routine-keeper",
    name: "The Routine Keeper",
    tagline: "Breakfast has already found a steady place in your mornings.",
    description:
      "You usually make room for breakfast instead of deciding from scratch every day. A predictable routine seems to make it easier for breakfast to fit naturally into your morning.",
    traits: [
      "Breakfast is usually part of your regular routine",
      "Your morning plans tend to stay relatively predictable",
      "You are less likely to change your breakfast plan at the last minute",
    ],
    closingNote:
      "When the morning has a rhythm, breakfast tends to stay in it.",
  },
  "sleep-saver": {
    id: "sleep-saver",
    name: "The Sleep Saver",
    tagline: "Sometimes, a few extra minutes of sleep win.",
    description:
      "Your mornings often involve a trade-off between getting enough rest and making time for breakfast. When the night runs late or the morning feels rushed, sleep can become the priority.",
    traits: [
      "How much sleep you get strongly shapes your morning",
      "Late nights can make breakfast harder to fit in",
      "Eating later can sometimes feel easier than getting up earlier",
    ],
    closingNote:
      "Breakfast isn’t necessarily off the table — sleep just gets the first vote sometimes.",
  },
  "schedule-juggler": {
    id: "schedule-juggler",
    name: "The Schedule Juggler",
    tagline: "Your calendar has a lot to say about breakfast.",
    description:
      "Whether breakfast fits into your morning often depends on classes, meetings, and how much time you have before the day starts moving.",
    traits: [
      "Early commitments can strongly affect whether you eat breakfast",
      "Available morning time matters a lot",
      "Your breakfast routine changes when your schedule changes",
    ],
    closingNote:
      "Give your morning some breathing room, and breakfast has a much better chance.",
  },
  "flexible-switcher": {
    id: "flexible-switcher",
    name: "The Flexible Switcher",
    tagline: "Your breakfast plan depends on how the morning unfolds.",
    description:
      "You don’t follow one fixed breakfast routine every day. Hunger, timing, plans, the menu, and unexpected changes can all shift what you decide to do.",
    traits: [
      "Your breakfast decision often changes from day to day",
      "You adapt quickly when plans or timings change",
      "What feels right in the moment matters more than a fixed routine",
    ],
    closingNote:
      "Your mornings are less about rules and more about adapting to the day.",
  },
  "alternative-forager": {
    id: "alternative-forager",
    name: "The Alternative Forager",
    tagline: "If the mess doesn’t work out, you usually have another option.",
    description:
      "Breakfast doesn’t always have to happen at the mess for you. You are comfortable shifting the time, place, or type of food depending on what works that morning.",
    traits: [
      "You often have alternative food options available",
      "Eating later or somewhere else can feel more convenient",
      "Your breakfast routine is not tied to one place",
    ],
    closingNote:
      "For you, breakfast is flexible — the mess is only one of several possibilities.",
  },
  "meal-maximizer": {
    id: "meal-maximizer",
    name: "The Meal Maximizer",
    tagline: "You try not to let a paid meal go to waste.",
    description:
      "You don’t like letting an allotted meal go to waste. If plans change, you’re more likely to use, swap, sell, or redirect it.",
    traits: [
      "You dislike leaving a paid-for meal unused",
      "Being able to sell, exchange, or gift it matters to you",
      "You're likely to use, swap, or redirect a breakfast you can't eat",
      "Value for money plays into your breakfast decisions",
    ],
    closingNote: "If you can't use it yourself, you'd rather someone else does.",
  },
}
