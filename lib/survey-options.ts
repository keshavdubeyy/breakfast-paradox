export interface SurveyOption {
  value: string
  label: string
}

export const YEAR_OPTIONS: SurveyOption[] = [
  { value: "1", label: "1st year" },
  { value: "2", label: "2nd year" },
  { value: "3", label: "3rd year" },
  { value: "4", label: "4th year" },
  { value: "5", label: "5th year or above" },
  { value: "other", label: "Other / Not applicable" },
]

export const HOSTEL_OPTIONS: SurveyOption[] = [
  { value: "bakul", label: "Bakul" },
  { value: "parijat", label: "Parijat" },
  { value: "obh", label: "OBH" },
  { value: "kadamba", label: "Kadamba" },
]

export const GENDER_OPTIONS: SurveyOption[] = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non-binary", label: "Non-binary / another identity" },
  { value: "transgender-man", label: "Transgender Man" },
  { value: "transgender-woman", label: "Transgender Woman" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
]

export const EARLY_COMMITMENT_OPTIONS: SurveyOption[] = [
  { value: "0", label: "0 days" },
  { value: "1", label: "1 day" },
  { value: "2", label: "2 days" },
  { value: "3", label: "3 days" },
  { value: "4", label: "4 days" },
  { value: "5+", label: "5+ days" },
]

export const SLEEP_TIME_OPTIONS: SurveyOption[] = [
  { value: "before-11pm", label: "Before 11:00 PM" },
  { value: "11pm-12am", label: "11:00 PM–12:00 AM" },
  { value: "12am-1am", label: "12:00–1:00 AM" },
  { value: "1am-2am", label: "1:00–2:00 AM" },
  { value: "2am-3am", label: "2:00–3:00 AM" },
  { value: "after-3am", label: "After 3:00 AM" },
  { value: "no-consistent-time", label: "No consistent time" },
]

export const WAKE_TIME_OPTIONS: SurveyOption[] = [
  { value: "before-630am", label: "Before 6:30 AM" },
  { value: "630-700am", label: "6:30–7:00 AM" },
  { value: "700-730am", label: "7:00–7:30 AM" },
  { value: "730-800am", label: "7:30–8:00 AM" },
  { value: "800-830am", label: "8:00–8:30 AM" },
  { value: "830-900am", label: "8:30–9:00 AM" },
  { value: "900-1000am", label: "9:00–10:00 AM" },
  { value: "after-1000am", label: "After 10:00 AM" },
  { value: "no-consistent-time", label: "No consistent time" },
]

export const OTHER_ACTIVITY_VALUE = "other"

export const BEFORE_SLEEP_ACTIVITY_OPTIONS: SurveyOption[] = [
  { value: "studying", label: "Studying / assignments" },
  { value: "project-work", label: "Project work" },
  { value: "internship-work", label: "Internship / work" },
  { value: "club-activities", label: "Club activities" },
  { value: "friends", label: "Spending time with friends" },
  {
    value: "content-gaming-social",
    label: "Watching content / gaming / social media",
  },
  {
    value: "eating-late-night",
    label: "Eating / ordering food / going to a late-night canteen",
  },
  { value: "exercise-sports", label: "Exercise / sports" },
  { value: "personal-tasks", label: "Personal tasks" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const MORNING_ACTIVITY_OPTIONS: SurveyOption[] = [
  { value: "check-phone", label: "Check phone/messages" },
  { value: "get-ready", label: "Get ready" },
  { value: "study-work", label: "Study / work" },
  { value: "exercise-sport", label: "Exercise / play a sport" },
  { value: "go-to-mess", label: "Go to the mess" },
  { value: "eat-in-room", label: "Eat or drink something in my room" },
  {
    value: "buy-order-elsewhere",
    label: "Buy/order something to eat or drink elsewhere",
  },
  {
    value: "go-to-class",
    label: "Go directly to class / meeting / other commitment",
  },
  { value: "go-back-to-sleep", label: "Go back to sleep or rest" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const MESS_DECISION_OPTIONS: SurveyOption[] = [
  {
    value: "self-registered",
    label: "I usually register/select a mess myself in advance",
  },
  {
    value: "auto-allotted",
    label: "I usually don’t register, so a mess gets automatically allotted to me",
  },
  {
    value: "mixed",
    label: "Sometimes I register myself, and sometimes I get automatically allotted",
  },
  { value: "not-sure", label: "I’m not sure" },
]

export const FREQUENCY_OPTIONS: SurveyOption[] = [
  { value: "almost-always", label: "Almost always" },
  { value: "often", label: "Often" },
  { value: "sometimes", label: "Sometimes" },
  { value: "rarely", label: "Rarely" },
  { value: "never", label: "Never" },
]

export const RESALE_ACTION_VALUES = ["sell", "exchange", "give-away"] as const

export const BREAKFAST_CHANGE_ACTION_OPTIONS: SurveyOption[] = [
  { value: "use-allotted", label: "Still use the allotted meal" },
  { value: "exchange", label: "Exchange it with another student" },
  { value: "sell", label: "Sell it" },
  { value: "give-away", label: "Give it away" },
  { value: "buy-others-meal", label: "Buy/get another student’s meal" },
  { value: "eat-elsewhere", label: "Eat at another mess/canteen" },
  { value: "order-online", label: "Order food online" },
  { value: "leave-unused", label: "Leave the meal unused" },
  { value: "skip-breakfast", label: "Skip breakfast" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const BREAKFAST_FREQUENCY_OPTIONS: SurveyOption[] = [
  { value: "almost-every-day", label: "Almost every day" },
  { value: "most-days", label: "Most days" },
  { value: "some-days", label: "Some days" },
  { value: "rarely", label: "Rarely" },
  { value: "never", label: "Never" },
]

// --- Branch A: regular breakfast eaters (almost every day / most days) ---

export const MESS_BREAKFAST_TIME_OPTIONS: SurveyOption[] = [
  { value: "before-730am", label: "Before 7:30 AM" },
  { value: "730-800am", label: "7:30–8:00 AM" },
  { value: "800-830am", label: "8:00–8:30 AM" },
  { value: "830-900am", label: "8:30–9:00 AM" },
  { value: "900-930am", label: "9:00–9:30 AM" },
  { value: "varies-a-lot", label: "It varies a lot" },
]

export const BREAKFAST_MOMENT_OPTIONS: SurveyOption[] = [
  { value: "before-getting-ready", label: "Before getting ready" },
  { value: "after-getting-ready", label: "After getting ready" },
  { value: "on-the-way", label: "On the way to class / another commitment" },
  { value: "just-before", label: "Just before class / another commitment" },
  {
    value: "after-early-commitment",
    label: "After an early class / commitment",
  },
  { value: "no-fixed-point", label: "It does not happen at a fixed point" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const BREAKFAST_ROUTINE_DURATION_OPTIONS: SurveyOption[] = [
  { value: "under-10-min", label: "Less than 10 minutes" },
  { value: "10-15-min", label: "10–15 minutes" },
  { value: "16-20-min", label: "16–20 minutes" },
  { value: "21-30-min", label: "21–30 minutes" },
  { value: "over-30-min", label: "More than 30 minutes" },
  { value: "varies-a-lot", label: "It varies a lot" },
]

export const YES_NO_SOMETIMES_OPTIONS: SurveyOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "sometimes", label: "Sometimes" },
]

export const EARLY_CLASS_ROUTINE_CHANGE_OPTIONS: SurveyOption[] = [
  { value: "wake-up-earlier", label: "Wake up earlier" },
  { value: "get-ready-faster", label: "Get ready faster" },
  {
    value: "less-time-other-activity",
    label: "Spend less time on another morning activity",
  },
  { value: "go-to-mess-earlier", label: "Go to the mess earlier" },
  { value: "eat-more-quickly", label: "Eat more quickly" },
  {
    value: "choose-convenient-mess",
    label: "Choose a closer or more convenient mess",
  },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const MISSED_BREAKFAST_FREQUENCY_OPTIONS: SurveyOption[] = [
  { value: "often", label: "Often" },
  { value: "sometimes", label: "Sometimes" },
  { value: "rarely", label: "Rarely" },
  { value: "never", label: "Never" },
]

export const MISSED_BREAKFAST_REASON_OPTIONS: SurveyOption[] = [
  { value: "woke-up-later", label: "I wake up later than usual" },
  { value: "earlier-commitment", label: "I have an earlier class/commitment" },
  { value: "less-time", label: "I have less time than usual" },
  { value: "not-hungry", label: "I don’t feel hungry" },
  { value: "dont-like-menu", label: "I don’t like the menu" },
  {
    value: "mess-allocation-issue",
    label: "My mess allocation does not work for me",
  },
  { value: "plans-changed", label: "My plans change unexpectedly" },
  { value: "ate-elsewhere", label: "I eat somewhere else instead" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const UNWANTED_MESS_ACTION_OPTIONS: SurveyOption[] = [
  { value: "cancel-meal", label: "Cancel the meal" },
  { value: "exchange", label: "Exchange it with another student" },
  { value: "sell", label: "Sell it to another student" },
  { value: "give-away", label: "Give it to another student" },
  { value: "buy-others-meal", label: "Buy/get another student’s meal" },
  { value: "eat-elsewhere", label: "Eat at VC/canteen instead" },
  {
    value: "leave-unused",
    label: "Leave the registered/allotted meal unused",
  },
  { value: "skip-breakfast", label: "Skip breakfast" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const MESS_CONSISTENCY_OPTIONS: SurveyOption[] = [
  { value: "almost-always-same", label: "Yes, almost always" },
  { value: "changes-sometimes", label: "It changes sometimes" },
  { value: "changes-frequently", label: "It changes frequently" },
]

export const MESS_CHANGE_DETERMINANT_OPTIONS: SurveyOption[] = [
  { value: "allocation", label: "Allocation" },
  { value: "menu", label: "Menu" },
  { value: "proximity", label: "Proximity" },
  { value: "friends", label: "Friends" },
  { value: "queue", label: "Queue" },
  { value: "timing", label: "Timing" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const BREAKFAST_ROUTINE_DESCRIPTION_OPTIONS: SurveyOption[] = [
  { value: "actively-plan", label: "I actively plan for it" },
  {
    value: "automatic-part",
    label: "It is mostly an automatic part of my routine",
  },
  { value: "depends-on-day", label: "It depends on the day" },
  { value: "decide-in-moment", label: "I usually decide in the moment" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

// --- Branch B: conditional breakfast eaters (Q7 = some days) ---

export const BREAKFAST_DECISION_POINT_OPTIONS: SurveyOption[] = [
  { value: "previous-night", label: "Previous night" },
  { value: "on-waking", label: "When I wake up" },
  { value: "while-getting-ready", label: "While getting ready" },
  { value: "after-checking-time", label: "After checking the time" },
  { value: "after-checking-menu", label: "After checking the menu" },
  {
    value: "after-checking-allocation",
    label: "After checking my mess allocation",
  },
  {
    value: "just-before-leaving",
    label: "Just before leaving for class or another commitment",
  },
  {
    value: "no-conscious-decision",
    label: "I don’t usually make a conscious decision",
  },
  { value: "varies", label: "It varies" },
]

export const BREAKFAST_DAY_DIFFERENTIATOR_OPTIONS: SurveyOption[] = [
  { value: "sleep-amount", label: "How much sleep I got" },
  { value: "wake-time", label: "What time I woke up" },
  { value: "first-commitment-time", label: "Time of first class or commitment" },
  { value: "morning-time-available", label: "How much time I have in the morning" },
  { value: "menu", label: "Breakfast menu" },
  { value: "mess-allocation", label: "Mess allocation" },
  { value: "hunger", label: "How hungry I feel" },
  { value: "friends-going", label: "Whether friends are going" },
  { value: "queue-wait", label: "Queue or waiting time" },
  { value: "distance-convenience", label: "Distance or convenience" },
  {
    value: "ate-late-previous-night",
    label: "Whether I ate late the previous night",
  },
  { value: "unexpected-plan-change", label: "My plans changed unexpectedly" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const BREAKFAST_PLAN_CHANGE_REASON_OPTIONS: SurveyOption[] = [
  {
    value: "woke-different-than-expected",
    label: "I wake up earlier/later than expected",
  },
  {
    value: "time-different-than-expected",
    label: "I have more/less time than expected",
  },
  { value: "schedule-changed", label: "My class or meeting schedule changes" },
  {
    value: "hunger-different-than-expected",
    label: "I feel more/less hungry than expected",
  },
  { value: "menu", label: "The menu" },
  { value: "mess-allocation", label: "My mess allocation" },
  { value: "friends-plans", label: "Friends’ plans" },
  { value: "ate-late-previous-night", label: "I ate late the previous night" },
  { value: "unexpected-event", label: "Something unexpected comes up" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

// --- Branch C: rare / non-breakfast eaters (rarely / never) ---

export const BREAKFAST_SERVED_TIME_ACTIVITY_OPTIONS: SurveyOption[] = [
  { value: "sleeping", label: "Sleeping" },
  { value: "getting-ready", label: "Getting ready" },
  {
    value: "travelling",
    label: "Travelling to class or another commitment",
  },
  { value: "already-in-class", label: "Already in class or a meeting" },
  { value: "studying-working", label: "Studying or working" },
  { value: "exercising", label: "Exercising" },
  { value: OTHER_ACTIVITY_VALUE, label: "Something else" },
]

export const BREAKFAST_ABSENCE_REASON_OPTIONS: SurveyOption[] = [
  { value: "decide-not-to-go", label: "I usually decide not to go" },
  {
    value: "not-part-of-routine",
    label: "It usually just doesn’t become part of my routine",
  },
  { value: "depends-on-day", label: "It depends on the day" },
  {
    value: "havent-thought-about-it",
    label: "I haven’t really thought about it",
  },
]

export const BREAKFAST_ABSENCE_DECISION_POINT_OPTIONS: SurveyOption[] = [
  { value: "previous-night", label: "Previous night" },
  { value: "when-i-wake-up", label: "When I wake up" },
  { value: "while-getting-ready", label: "While getting ready" },
  { value: "after-checking-time", label: "After checking the time" },
  { value: "after-checking-menu", label: "After checking the menu" },
  {
    value: "after-checking-mess-allocation",
    label: "After checking my mess allocation",
  },
  { value: "just-before-leaving", label: "Just before leaving" },
  {
    value: "no-conscious-decision",
    label: "I don’t usually make a conscious decision",
  },
  { value: "varies", label: "It varies" },
]

export const OCCASIONAL_BREAKFAST_FREQUENCY_OPTIONS: SurveyOption[] = [
  { value: "yes-sometimes", label: "Yes, sometimes" },
  { value: "very-rarely", label: "Very rarely" },
  { value: "never", label: "Never" },
]

export const OCCASIONAL_BREAKFAST_DIFFERENTIATOR_OPTIONS: SurveyOption[] = [
  { value: "more-time", label: "More time in the morning" },
  { value: "woke-up-earlier", label: "Woke up earlier" },
  { value: "no-early-commitment", label: "No early class or commitment" },
  { value: "menu-i-wanted", label: "Menu I wanted" },
  { value: "felt-hungry", label: "Felt hungry" },
  { value: "friends-were-going", label: "Friends were going" },
  {
    value: "different-mess-allocation",
    label: "Different or preferred mess allocation",
  },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const UNUSED_ALLOTTED_MEAL_ACTION_OPTIONS: SurveyOption[] = [
  { value: "sell", label: "I sell it" },
  { value: "exchange", label: "Exchange it with someone" },
  { value: "give-away", label: "Give it to someone" },
  { value: "leave-unused", label: "Leave it unused" },
  {
    value: "try-transfer-sometimes-cant",
    label: "I try to transfer it but sometimes can’t",
  },
  { value: "not-sure", label: "I’m not sure" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const YES_NO_NOT_SURE_OPTIONS: SurveyOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not sure" },
]

// --- Section 4: After your morning routine (asked of everyone, after the
// Branch A/B/C follow-up on the Breakfast Routine page) ---

export const NON_BREAKFAST_MEAL_SOURCE_OPTIONS: SurveyOption[] = [
  { value: "eat-in-room", label: "Eat something I already have in my room" },
  { value: "buy-vc-canteen", label: "Buy food from VC / another canteen" },
  { value: "order-online", label: "Order food online" },
  { value: "eat-elsewhere-campus", label: "Eat somewhere else on campus" },
  { value: "wait-until-lunch", label: "Wait until lunch without eating" },
  { value: "varies", label: "It varies depending on the day" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const NEXT_FOOD_TIME_OPTIONS: SurveyOption[] = [
  { value: "before-10am", label: "Before 10:00 AM" },
  { value: "10-11am", label: "10:00–11:00 AM" },
  { value: "11am-12pm", label: "11:00 AM–12:00 PM" },
  { value: "around-lunchtime", label: "Around lunchtime" },
  { value: "after-lunchtime", label: "After lunch time" },
  { value: "varies-a-lot", label: "It varies a lot" },
]

export const EARLY_COMMITMENT_BREAKFAST_FREQUENCY_OPTIONS: SurveyOption[] = [
  { value: "almost-always", label: "Almost always" },
  { value: "often", label: "Often" },
  { value: "sometimes", label: "Sometimes" },
  { value: "rarely", label: "Rarely" },
  { value: "never", label: "Never" },
  { value: "not-applicable", label: "Not applicable" },
]

export const WEEKEND_BREAKFAST_COMPARISON_OPTIONS: SurveyOption[] = [
  { value: "more-often", label: "More often" },
  { value: "about-the-same", label: "About the same" },
  { value: "less-often", label: "Less often" },
  {
    value: "rarely-never-either",
    label: "I rarely/never eat breakfast at the mess on either",
  },
]

export const WEEKEND_DIFFERENTIATOR_OPTIONS: SurveyOption[] = [
  { value: "sleep-later", label: "I sleep later" },
  { value: "wake-later", label: "I wake up later" },
  { value: "fewer-early-commitments", label: "I have fewer/no early commitments" },
  { value: "more-morning-time", label: "I have more time in the morning" },
  { value: "different-food-plans", label: "My food plans are different" },
  {
    value: "different-friend-plans",
    label: "My plans with friends are different",
  },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const NON_BREAKFAST_SPENDING_FREQUENCY_OPTIONS: SurveyOption[] = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often" },
  { value: "almost-always", label: "Almost always" },
]

export const NON_BREAKFAST_SPENDING_AMOUNT_OPTIONS: SurveyOption[] = [
  { value: "under-50", label: "Under ₹50" },
  { value: "50-100", label: "₹50–100" },
  { value: "101-150", label: "₹101–150" },
  { value: "over-150", label: "More than ₹150" },
  { value: "varies-a-lot", label: "It varies a lot" },
]

export const SEMESTER_BREAKFAST_CHANGE_OPTIONS: SurveyOption[] = [
  { value: "more-often-now", label: "I eat breakfast more often now" },
  { value: "about-the-same", label: "It is about the same" },
  { value: "less-often-now", label: "I eat breakfast less often now" },
  { value: "changed-back-and-forth", label: "It has changed back and forth" },
  { value: "not-sure", label: "I’m not sure" },
]

export const COMPARISON_SCALE_OPTIONS: SurveyOption[] = [
  { value: "much-lower", label: "Much lower" },
  { value: "slightly-lower", label: "Slightly lower" },
  { value: "about-the-same", label: "About the same" },
  { value: "slightly-higher", label: "Slightly higher" },
  { value: "much-higher", label: "Much higher" },
  { value: "cant-compare", label: "Can’t really compare" },
]

export interface ScaleRowItem {
  key: string
  label: string
  /** Optional clarifying note shown under the row label, e.g. to disambiguate direction on a row where "higher" doesn't obviously mean "better" the way it does for the other rows in the same grid. */
  helperText?: string
}

export const COMPARISON_ROW_ITEMS: ScaleRowItem[] = [
  { key: "comparisonEnergyLevel", label: "Energy level" },
  { key: "comparisonConcentration", label: "Ability to concentrate" },
  {
    key: "comparisonHunger",
    label: "Hunger",
    helperText:
      "“Higher” means feeling hungrier than usual — not necessarily worse, just different.",
  },
]

export const PREVIOUS_NIGHT_AFFECTS_OPTIONS: SurveyOption[] = [
  { value: "yes-often", label: "Yes, often" },
  { value: "sometimes", label: "Sometimes" },
  { value: "rarely", label: "Rarely" },
  { value: "never", label: "Never" },
  { value: "it-depends", label: "It depends" },
]

export const PREVIOUS_NIGHT_FACTOR_OPTIONS: SurveyOption[] = [
  { value: "ate-late-at-night", label: "I ate late at night" },
  {
    value: "ordered-food-canteen",
    label: "I ordered food / ate at David’s or another canteen",
  },
  {
    value: "wake-hungry-or-not",
    label: "I wake up feeling hungry or not hungry",
  },
  {
    value: "felt-hungry-after-skipping",
    label: "I felt hungry or low on energy after skipping breakfast previously",
  },
  {
    value: "had-to-buy-food-later",
    label: "I had to buy food later after missing breakfast",
  },
  { value: "next-morning-schedule", label: "My schedule for the next morning" },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const INFLUENCE_SCALE_OPTIONS: SurveyOption[] = [
  { value: "not-at-all", label: "Not at all" },
  { value: "slightly", label: "Slightly" },
  { value: "moderately", label: "Moderately" },
  { value: "a-lot", label: "A lot" },
  { value: "very-strongly", label: "Very strongly" },
]

/**
 * Embedded attention check: a row planted mid-grid (not first/last) asking
 * for a specific answer, so low-attention/straightlining responses on this
 * 14-row grid can be flagged during analysis. It's still required to
 * answer like any other row, but no particular VALUE is enforced at
 * submission time — flagging is an analysis-time concern, not a UX gate.
 */
export const ATTENTION_CHECK_INFLUENCE_KEY = "attentionCheckInfluence"
export const ATTENTION_CHECK_EXPECTED_VALUE = "a-lot"

export const INFLUENCE_FACTOR_ITEMS: ScaleRowItem[] = [
  { key: "sleepAmountInfluence", label: "How much sleep I got" },
  {
    key: "firstCommitmentTimeInfluence",
    label: "Time of my first class/meeting",
  },
  { key: "morningTimeInfluence", label: "How much time I have in the morning" },
  { key: "breakfastServingTimeInfluence", label: "Breakfast serving time" },
  { key: "breakfastMenuInfluence", label: "Breakfast menu" },
  {
    key: "messAllocationInfluence",
    label: "Which mess I am allotted/registered for",
  },
  { key: "distanceInfluence", label: "Distance to the mess" },
  {
    key: ATTENTION_CHECK_INFLUENCE_KEY,
    label: `To show you're reading each row, please select “${
      INFLUENCE_SCALE_OPTIONS.find(
        (option) => option.value === ATTENTION_CHECK_EXPECTED_VALUE
      )!.label
    }” for this one.`,
  },
  { key: "queueWaitInfluence", label: "Queue/waiting time" },
  { key: "friendsGoingInfluence", label: "Whether my friends are going" },
  {
    key: "hungerOnWakingInfluence",
    label: "Whether I feel hungry when I wake up",
  },
  {
    key: "ateLatePreviousNightInfluence",
    label: "Whether I ate late the previous night",
  },
  {
    key: "canteenAvailabilityInfluence",
    label: "Availability of food at David’s / VC / other canteens",
  },
  { key: "onlineOrderingInfluence", label: "Ability to order food online" },
  {
    key: "resaleAbilityInfluence",
    label: "Ability to sell/exchange/give away my registered breakfast",
  },
]

export const AGREEMENT_SCALE_OPTIONS: SurveyOption[] = [
  { value: "strongly-disagree", label: "Strongly disagree" },
  { value: "disagree", label: "Disagree" },
  { value: "neutral", label: "Neutral" },
  { value: "agree", label: "Agree" },
  { value: "strongly-agree", label: "Strongly agree" },
]

export const AGREEMENT_STATEMENT_ITEMS: ScaleRowItem[] = [
  {
    key: "sleepOverBreakfastAgreement",
    label:
      "If I have slept late, getting a little more sleep feels more important than having breakfast.",
  },
  {
    key: "eatLaterInsteadAgreement",
    label: "If I miss breakfast, I usually feel I can just eat something later.",
  },
  {
    key: "classOnTimeOverBreakfastAgreement",
    label:
      "Reaching class on time is more important to me than having breakfast at the mess.",
  },
  {
    key: "alreadyPaidUseWheneverAgreement",
    label:
      "Since I have already paid for mess food, I prefer to use the meal whenever possible.",
  },
  {
    key: "resaleReducesConcernAgreement",
    label:
      "If I can sell, exchange, or give away my breakfast, I am less concerned about not using it myself.",
  },
  {
    key: "breakfastPlannedInAdvanceAgreement",
    label: "Breakfast is something I usually plan for in advance.",
  },
  {
    key: "dependsOnMorningAgreement",
    label:
      "Whether I eat breakfast depends more on how my morning is going than on a fixed routine.",
  },
  {
    key: "noHungerNoReasonAgreement",
    label:
      "If I do not feel hungry in the morning, I usually do not see a reason to eat breakfast.",
  },
  {
    key: "inconvenientEatLaterAgreement",
    label:
      "If getting breakfast feels inconvenient, I would rather eat later or somewhere else.",
  },
]

export const BREAKFAST_IMPROVEMENT_OPTIONS: SurveyOption[] = [
  {
    value: "better-timing",
    label: "Breakfast timings that fit my schedule better",
  },
  { value: "grab-and-go", label: "Faster / grab-and-go breakfast options" },
  { value: "better-menu", label: "Better menu choices" },
  { value: "easier-mess-change", label: "Easier mess selection or change" },
  {
    value: "more-cancel-flexibility",
    label: "More flexibility to cancel a meal",
  },
  {
    value: "official-exchange-system",
    label: "An official way to exchange or transfer meals",
  },
  { value: "shorter-queues", label: "Shorter queues / less waiting time" },
  {
    value: "closer-location",
    label: "Breakfast available closer to where I stay or attend class",
  },
  {
    value: "fewer-early-commitments",
    label: "Fewer early-morning commitments",
  },
  {
    value: "nothing-would-change",
    label: "Nothing would significantly change my routine",
  },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const MAX_BREAKFAST_IMPROVEMENT_SELECTIONS = 3

// --- Added follow-ups: motivation, perceived value, food quality ---

export const BREAKFAST_MOTIVATION_OPTIONS: SurveyOption[] = [
  { value: "feel-hungry", label: "I feel hungry" },
  { value: "part-of-routine", label: "It’s part of my routine / habit" },
  {
    value: "already-paid",
    label: "I already paid for it, so I want to use it",
  },
  { value: "friends-going", label: "I’m going with friends" },
  { value: "menu-that-day", label: "The menu that day" },
  {
    value: "time-before-commitment",
    label: "I have time before my first class/commitment",
  },
  {
    value: "helps-focus-energy",
    label: "It helps me focus or feel more energized",
  },
  { value: OTHER_ACTIVITY_VALUE, label: "Other" },
]

export const MEAL_VALUE_PERCEPTION_OPTIONS: SurveyOption[] = [
  {
    value: "good-value",
    label: "It feels like good value for how often I use it",
  },
  {
    value: "okay-not-every-time",
    label: "It feels okay, even though I don’t use it every time",
  },
  {
    value: "somewhat-wasteful",
    label: "It feels somewhat wasteful given how often I use it",
  },
  {
    value: "very-wasteful",
    label: "It feels very wasteful — I rarely get value from it",
  },
  {
    value: "not-sure-how-cost-works",
    label: "I’m not sure how the cost/allocation works",
  },
  {
    value: "not-applicable",
    label: "Not applicable — I don’t pay for a mess plan",
  },
]

export const MESS_FOOD_QUALITY_OPTIONS: SurveyOption[] = [
  { value: "very-good", label: "Very good" },
  { value: "good", label: "Good" },
  { value: "average", label: "Average" },
  { value: "poor", label: "Poor" },
  { value: "very-poor", label: "Very poor" },
  {
    value: "not-enough-experience",
    label: "I don’t have enough experience to say",
  },
]
