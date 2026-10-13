// Causal-loop-diagram content for the breakfast system — hand-synthesized
// from every data source this project has collected: the anonymous
// student survey (lib/analytics/*), the April 2026 mess attendance +
// menu export (lib/analytics/mess-attendance, lib/analytics/mess-menu),
// the mess-team interview (docs/activity-5-system-behaviour-over-time.md
// §3a), and the Spring 2026 class timetable (lib/analytics/administration,
// class_schedule table).
//
// This is a synthesis document, not a computation over AnalyticsRow[] —
// like docs/activity-5-system-behaviour-over-time.md and the mess
// operations notes card, nothing here is derived fresh from rows at
// request time. Every relationship cites the real figure(s) it rests on;
// where the evidence is thin, indirect, or cross-sectional-only, that is
// stated explicitly rather than smoothed over. Nothing here asserts a
// link this project has no evidence for.

export type ActorCategory = "student" | "mess" | "admin" | "data"

export const CATEGORY_LABEL: Record<ActorCategory, string> = {
  student: "Student",
  mess: "Mess / food service",
  admin: "Administration / timetable",
  data: "Data system",
}

// Tailwind color tokens per category, used consistently across every
// diagram and badge on the page.
export const CATEGORY_COLOR: Record<
  ActorCategory,
  { text: string; bg: string; border: string; dot: string; svgFill: string; svgStroke: string }
> = {
  student: {
    text: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-300/70 dark:border-blue-800",
    dot: "bg-blue-500",
    svgFill: "fill-blue-50 dark:fill-blue-950",
    svgStroke: "stroke-blue-600 dark:stroke-blue-300",
  },
  mess: {
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-300/70 dark:border-amber-800",
    dot: "bg-amber-500",
    svgFill: "fill-amber-50 dark:fill-amber-950",
    svgStroke: "stroke-amber-600 dark:stroke-amber-300",
  },
  admin: {
    text: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-300/70 dark:border-purple-800",
    dot: "bg-purple-500",
    svgFill: "fill-purple-50 dark:fill-purple-950",
    svgStroke: "stroke-purple-600 dark:stroke-purple-300",
  },
  data: {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300/70 dark:border-emerald-800",
    dot: "bg-emerald-500",
    svgFill: "fill-emerald-50 dark:fill-emerald-950",
    svgStroke: "stroke-emerald-600 dark:stroke-emerald-300",
  },
}

export interface Actor {
  id: string
  label: string
  category: ActorCategory
  description: string
}

export const ACTORS: Actor[] = [
  {
    id: "students",
    label: "Students",
    category: "student",
    description:
      "Individually decide, most often same-morning rather than in advance, whether to eat at the mess — shaped by sleep, wake time, class timing, and menu.",
  },
  {
    id: "mess-staff",
    label: "Mess staff / vendors",
    category: "mess",
    description:
      "Prepare and serve breakfast (6:00 AM prep start, 7:30–9:30 AM service). Set preparation quantity from historical data, projections, and experience. One interview, single source.",
  },
  {
    id: "cds-admin",
    label: "CDS / administration",
    category: "admin",
    description:
      "Jointly drafts the menu with student coordinators and mess vendors. Sets and owns the class timetable independently of mess operations.",
  },
  {
    id: "student-coordinators",
    label: "Student coordinators",
    category: "admin",
    description: "Participate in menu drafting alongside CDS and mess vendors — not observed making preparation-quantity decisions.",
  },
  {
    id: "academic-timetable-system",
    label: "Academic / timetable system",
    category: "admin",
    description:
      "The Spring 2026 class schedule (140 imported course-sections). Fixed, administratively set, and — per this project's own data rules — never joined to survey or mess records at the individual level (no shared ID).",
  },
  {
    id: "mess-portal-qr",
    label: "Mess portal / QR check-in system",
    category: "data",
    description:
      "Records registrations and swipe-in timestamps. Source of the April 2026 attendance export and the historical data the mess team says it uses for projections.",
  },
]

export interface Variable {
  id: string
  label: string
  category: ActorCategory
  description: string
}

export const VARIABLES: Variable[] = [
  // Student
  { id: "lateNightWorkload", label: "Late-night academic/screen workload", category: "student", description: "Studying, project work, and gaming/social media/content before sleep." },
  { id: "lateBedtime", label: "Bedtime (weekday)", category: "student", description: "Self-reported weekday sleep-time bucket." },
  { id: "wakeUpTime", label: "Wake-up time (weekday)", category: "student", description: "Self-reported weekday wake-time bucket." },
  { id: "availableMorningTime", label: "Available time before first commitment", category: "student", description: "The gap between waking and the day's first class/commitment." },
  { id: "earlyMorningClass", label: "Has an early class/commitment that day", category: "student", description: "Whether a student's day includes an early first commitment." },
  { id: "perceivedValueOfSleep", label: "Perceived value of extra sleep vs. breakfast", category: "student", description: "How strongly a student weighs a few more minutes of sleep against eating." },
  { id: "menuAttractiveness", label: "Perceived menu attractiveness (that day)", category: "student", description: "How appealing that day's dish is perceived to be." },
  { id: "queueServicePressure", label: "Perceived queue/service pressure", category: "student", description: "How much waiting/crowding is felt to matter in the decision." },
  { id: "postSkipCoping", label: "\"I can just eat later\" coping belief", category: "student", description: "The belief that skipping mess breakfast is low-cost because another option exists." },
  { id: "motivationToEatBreakfast", label: "Motivation to eat breakfast (that day)", category: "student", description: "The net pull toward eating, before the decision resolves." },
  { id: "likelihoodOfSkipping", label: "Likelihood of skipping breakfast", category: "student", description: "The resolved eat/skip decision, aggregated across students and days." },
  { id: "breakfastArrivalConcentration", label: "Concentration of arrivals in a narrow window", category: "student", description: "How tightly student arrivals cluster within the 7:30–9:30 AM service window." },
  { id: "postSkipEnergyConcentration", label: "Energy/concentration after skipping", category: "student", description: "Self-reported energy and concentration before lunch on a skip day, vs. usual." },

  // Mess
  { id: "menuDraftingProcess", label: "Menu drafting (coordinators + CDS + vendors)", category: "mess", description: "The joint process that sets what's served — not itself observed in detail." },
  { id: "projectedDemand", label: "Projected demand (that day)", category: "mess", description: "The mess team's forecast, blending historical data and experience." },
  { id: "preparationQuantity", label: "Preparation quantity decision", category: "mess", description: "How much food is actually prepared." },
  { id: "advancePreparedFood", label: "Food prepared fully in advance", category: "mess", description: "Items that must be completely cooked before service starts — a fixed-supply constraint." },
  { id: "batchCookableCapacity", label: "Ability to cook additional batches mid-service", category: "mess", description: "A structural property of some menu items, not all." },
  { id: "additionalBatchesCooked", label: "Additional batches actually cooked", category: "mess", description: "The realized mid-service response, when shortage pressure and batch-cookability both apply." },
  { id: "actualTurnout", label: "Actual turnout (availed)", category: "mess", description: "How many registered breakfasts are actually collected/eaten." },
  { id: "foodShortage", label: "Food shortage / service pressure", category: "mess", description: "Running short mid-service when turnout exceeds preparation." },
  { id: "surplusFood", label: "Surplus food", category: "mess", description: "Food prepared but not served when turnout is below preparation." },
  { id: "foodWastage", label: "Food wastage", category: "mess", description: "Surplus that ends up thrown away or sent to pig farms." },
  { id: "wastageRecordingQuality", label: "Quality of wastage recording", category: "mess", description: "Currently informal — noted down or estimated from memory, not measured." },
  { id: "registrationVsConsumptionGap", label: "Registered-vs-consumed gap", category: "mess", description: "The difference between what's registered/prepared-for and what's actually availed." },

  // Admin / timetable
  { id: "classTimetableStructure", label: "Class timetable structure", category: "admin", description: "The Spring 2026 schedule's slot times, independent of breakfast operations." },
  { id: "earlySlotPrevalence", label: "Prevalence of early (8:30 AM) class slots", category: "admin", description: "How much of the timetable sits inside or adjacent to the breakfast window." },
  { id: "breakfastServiceWindow", label: "Breakfast service window (7:30–9:30 AM)", category: "admin", description: "Fixed; unchanged per the mess-team interview." },
  { id: "holidayCampusAbsence", label: "Holidays / students leaving campus", category: "admin", description: "Breaks from the academic calendar that reduce on-campus population." },

  // Data system
  { id: "registrationSystemInput", label: "Breakfast registrations (mess portal)", category: "data", description: "What students register for, ahead of the day." },
  { id: "qrCheckinData", label: "QR/swipe-in check-in data", category: "data", description: "The actual-availment record, timestamped." },
  { id: "historicalAttendanceData", label: "Historical attendance data", category: "data", description: "Accumulated registration + check-in history the mess draws projections from." },
  { id: "forecastAccuracy", label: "Quality of future demand estimates", category: "data", description: "How well projected demand tracks actual turnout." },
]

export type Polarity = "+" | "-"

export type EvidenceStrength = "strong" | "moderate" | "weak" | "interview-only" | "inferred"

export interface CausalLink {
  id: string
  from: string
  to: string
  polarity: Polarity
  explanation: string
  evidence: string
  strength: EvidenceStrength
  delay?: string
  flag?: string
}

export const CAUSAL_LINKS: CausalLink[] = [
  {
    id: "E1", from: "lateNightWorkload", to: "lateBedtime", polarity: "+",
    explanation: "More late-night studying/project work/screen time pushes bedtime later.",
    evidence: "57.5% report studying/assignments and 47.5% project work before sleep; 75% report watching content/gaming/social media before sleep. 75% of respondents sleep at or after midnight on weekdays (12–1 AM 22.5%, 1–2 AM 30%, 2–3 AM 12.5%, after 3 AM 10%).",
    strength: "moderate",
    flag: "Same-sample association, not a per-respondent paired cross-tab of workload against bedtime.",
  },
  {
    id: "E2", from: "lateBedtime", to: "wakeUpTime", polarity: "+",
    explanation: "A later bedtime tends to push wake-up time later too.",
    evidence: "Patterns already treats sleep-time and wake-time as linked ordinal constructs (lib/analytics/patterns/normalization.ts scores both).",
    strength: "inferred",
    flag: "Not a directly computed bedtime→wake-time correlation in this dataset — included as a standard behavioural assumption.",
  },
  {
    id: "E3", from: "wakeUpTime", to: "availableMorningTime", polarity: "-",
    explanation: "Waking up later leaves less time before a fixed first commitment.",
    evidence: "\"How much time I have in the morning\" — structural driver mean 2.80/4, top-box 68.3% (2nd-highest of 10 factors); named the single \"biggest influence factor\" by 31.7% of respondents (2nd-highest of 14).",
    strength: "strong",
  },
  {
    id: "E4", from: "earlyMorningClass", to: "availableMorningTime", polarity: "-",
    explanation: "An early first commitment compresses the same wake-to-class window from the other side.",
    evidence: "\"Time of my first class/meeting\" is the single highest-rated structural driver (mean 2.95/4, top-box 70.7%). Spring 2026 timetable: the earliest class slot is 8:30 AM, present on all 6 weekdays, 24 of 140 imported course-sections (17.1%) — inside the mess's own peak scan window (busiest 10-minute window: 09:20).",
    strength: "strong",
    flag: "The timetable and survey/mess datasets have no shared respondent ID and are never joined at the individual level — cited side by side, not merged.",
  },
  {
    id: "E5", from: "availableMorningTime", to: "motivationToEatBreakfast", polarity: "+",
    explanation: "Less available time reduces the motivation/ability to fit breakfast in.",
    evidence: "\"I have less time than usual\" cited by 38.9% of Branch A respondents who miss breakfast at least rarely (n=18); \"if getting breakfast feels inconvenient, I'd rather eat later or elsewhere\" — 68.3% agree/strongly agree.",
    strength: "strong",
  },
  {
    id: "E6", from: "perceivedValueOfSleep", to: "motivationToEatBreakfast", polarity: "-",
    explanation: "Valuing extra sleep more reduces motivation to get up for breakfast.",
    evidence: "\"If I have slept late, getting a little more sleep feels more important than having breakfast\" — 80.5% agree/strongly agree. \"How much sleep I got\" is the single most commonly named \"biggest influence factor\" (36.6%, highest of 14). sleepAmountInfluence mean 2.85/4, top-box 70.7%.",
    strength: "strong",
  },
  {
    id: "E7", from: "earlyMorningClass", to: "motivationToEatBreakfast", polarity: "-",
    explanation: "A separate mental-model pathway from E4/time-availability: punctuality is explicitly valued over breakfast, not just squeezed by the clock.",
    evidence: "\"Reaching class on time is more important to me than having breakfast at the mess\" — 82.9% agree/strongly agree.",
    strength: "strong",
  },
  {
    id: "E8", from: "menuAttractiveness", to: "motivationToEatBreakfast", polarity: "+",
    explanation: "A more appealing menu increases motivation to eat that day.",
    evidence: "Mess-team interview (single source): bonda, vada, and muesli named as drawing students. April data shows a real dish-level avail-rate spread: Mysoore Bonda 45.5% (best) vs. Wheat Upma 25.4% (worst). But breakfastMenuInfluence is the 2nd-weakest structural driver (mean 1.90/4, top-box 34.1%), and menu is named \"biggest influence\" by only 4.9% of respondents.",
    strength: "moderate",
    flag: "The interview's specific dish claims are only partly confirmed: Wada (also named as popular) ranks mid-table at 39.6% avail rate, 5th of 12 dishes; muesli only appears as a cereal side item in the menu export, never as a main dish, so it can't be checked the same way.",
  },
  {
    id: "E9", from: "queueServicePressure", to: "motivationToEatBreakfast", polarity: "-",
    explanation: "Perceived queue/wait pressure reduces motivation to go.",
    evidence: "queueWaitInfluence structural driver: mean 1.46/4, top-box 14.6% — the lowest-rated of all 10 structural/service factors.",
    strength: "weak",
    flag: "Queue/wait is often assumed operationally important, but it is the weakest self-reported influence on the eat/skip decision in this data — see the arrival-concentration tension below.",
  },
  {
    id: "E10", from: "postSkipCoping", to: "motivationToEatBreakfast", polarity: "-",
    explanation: "Believing skipping is low-cost (there's another food option) reduces the specific pull toward mess breakfast.",
    evidence: "\"If I miss breakfast, I usually feel I can just eat something later\" — 61% agree/strongly agree. 93.1% report actually buying/eating something else before lunch on a skip day, so the belief is largely borne out in practice.",
    strength: "strong",
  },
  {
    id: "E11", from: "motivationToEatBreakfast", to: "likelihoodOfSkipping", polarity: "-",
    explanation: "Lower net motivation resolves into a higher likelihood of skipping — the behavioural resolution of everything feeding motivation above.",
    evidence: "Convergent with every self-reported skip-reason and plan-change field cited across E5–E10.",
    strength: "strong",
  },
  {
    id: "E12", from: "likelihoodOfSkipping", to: "actualTurnout", polarity: "-",
    explanation: "More students skipping directly lowers actual availment.",
    evidence: "Mess-side: 37.1% avail rate / 62.9% unused across 32,162 April registered slots. Student-side: 88.9% report their allotted breakfast going unused or redirected (n=27); 69% don't eat breakfast at the mess every day.",
    strength: "strong",
  },
  {
    id: "E13", from: "likelihoodOfSkipping", to: "postSkipEnergyConcentration", polarity: "-",
    explanation: "Skipping breakfast associates with lower reported energy/concentration before lunch.",
    evidence: "On skip days: energy before lunch -0.57, concentration -0.23 (both lower than usual, -2..+2 scale); hunger +0.41 (higher than usual). n=23.",
    strength: "moderate",
    flag: "Self-reported comparison, not an objective measure. No evidence connects this back to the following night's routine — deliberately left open (see Delays).",
  },
  {
    id: "E14", from: "earlyMorningClass", to: "breakfastArrivalConcentration", polarity: "+",
    explanation: "Commitment timing (alongside wake-time distribution) concentrates whoever does eat into a narrow arrival band.",
    evidence: "Mess swipe-in data: scans cluster ~06:00–10:00, single busiest 10-minute window at 09:20 (2,365 scans). Mess-team interview, independently: arrivals rise from ~8:00–8:30, peak \"around 9:00 AM\" — quantitative and qualitative evidence agreeing.",
    strength: "strong",
  },
  {
    id: "E15", from: "breakfastArrivalConcentration", to: "queueServicePressure", polarity: "+",
    explanation: "Concentrated arrivals structurally raise queue/wait pressure at peak.",
    evidence: "The scan-volume spike itself (2,365 scans in one 10-minute window vs. much lower elsewhere) is direct structural evidence of real peak-time crowding.",
    strength: "moderate",
    flag: "System tension: despite this real, measured crowding peak, students self-report queue/wait as the weakest influence on their eat/skip decision (E9). This mismatch is noted, not resolved.",
  },
  {
    id: "E16", from: "registrationSystemInput", to: "historicalAttendanceData", polarity: "+",
    explanation: "Registration/portal counts accumulate into the historical record the mess draws on.",
    evidence: "Mess-team interview: \"the mess team receives previous data from the mess portal along with projections.\"",
    strength: "interview-only",
  },
  {
    id: "E17", from: "qrCheckinData", to: "historicalAttendanceData", polarity: "+",
    explanation: "Actual swipe-in outcomes become next period's history.",
    evidence: "Same interview quote; the April export itself (registered + availed + timestamp per slot) is exactly this kind of record.",
    strength: "moderate",
    delay: "Feeds forward into the next comparable day/week, not the same day.",
  },
  {
    id: "E18", from: "historicalAttendanceData", to: "projectedDemand", polarity: "+",
    explanation: "Historical same-weekday figures directly set the day's projection.",
    evidence: "Mess-team interview: \"the mess team decides the preparation quantity based on the provided data or the statistics from the previous week for the same day.\"",
    strength: "interview-only",
  },
  {
    id: "E19", from: "actualTurnout", to: "historicalAttendanceData", polarity: "+",
    explanation: "This cycle's turnout becomes part of next cycle's history — closing the mess-forecasting loop (see B1).",
    evidence: "Same interview quote (E16–E18); mechanically, the April CSV's own per-day rows are this history.",
    strength: "interview-only",
    delay: "Same-weekday, next week — not same-day.",
  },
  {
    id: "E20", from: "projectedDemand", to: "preparationQuantity", polarity: "+",
    explanation: "The forecast directly sets how much is prepared.",
    evidence: "Mess-team interview, directly.",
    strength: "interview-only",
  },
  {
    id: "E21", from: "preparationQuantity", to: "advancePreparedFood", polarity: "+",
    explanation: "For fixed-prep items, the quantity decision is locked in once cooking begins.",
    evidence: "Mess-team interview: \"other items need to be planned and cooked completely beforehand, making it harder to adjust quantities once service begins.\"",
    strength: "interview-only",
  },
  {
    id: "E22", from: "preparationQuantity", to: "surplusFood", polarity: "+",
    explanation: "Holding turnout fixed, preparing more raises the odds of surplus.",
    evidence: "Mess-team interview: \"when turnout is lower than expected... the excess food results in wastage.\"",
    strength: "interview-only",
  },
  {
    id: "E23", from: "actualTurnout", to: "surplusFood", polarity: "-",
    explanation: "Holding preparation fixed, higher turnout leaves less surplus — the inverse side of E22's mechanism.",
    evidence: "Same interview basis as E22.",
    strength: "inferred",
  },
  {
    id: "E24", from: "actualTurnout", to: "foodShortage", polarity: "+",
    explanation: "Higher-than-planned turnout creates shortage pressure.",
    evidence: "Mess-team interview: \"when turnout is higher than expected, for food items that allow it, the team cooks additional batches\" — implying shortage pressure precedes the batch response.",
    strength: "interview-only",
  },
  {
    id: "E25", from: "preparationQuantity", to: "foodShortage", polarity: "-",
    explanation: "Preparing more reduces the odds of running short, all else equal.",
    evidence: "Inverse of the same E20/E24 mechanism.",
    strength: "inferred",
  },
  {
    id: "E26", from: "foodShortage", to: "additionalBatchesCooked", polarity: "+",
    explanation: "Shortage pressure triggers the batch-cooking response, where possible.",
    evidence: "Mess-team interview, directly — explicitly conditional on \"food items that allow it.\"",
    strength: "interview-only",
  },
  {
    id: "E27", from: "batchCookableCapacity", to: "additionalBatchesCooked", polarity: "+",
    explanation: "Only batch-cookable items can actually be scaled up mid-service — a structural precondition.",
    evidence: "Mess-team interview: \"items that require less preparation time can be prepared in batches during breakfast service.\"",
    strength: "interview-only",
  },
  {
    id: "E28", from: "advancePreparedFood", to: "additionalBatchesCooked", polarity: "-",
    explanation: "Fully-advance-prepared items cannot be scaled up once service starts — the asymmetry the interview describes directly.",
    evidence: "Mess-team interview: \"other items need to be planned and cooked completely beforehand, making it harder to adjust quantities once service begins.\"",
    strength: "interview-only",
  },
  {
    id: "E29", from: "additionalBatchesCooked", to: "foodShortage", polarity: "-",
    explanation: "Cooking more closes the shortage gap.",
    evidence: "Mess-team interview (implied resolution of Q9's described response).",
    strength: "inferred",
  },
  {
    id: "E30", from: "surplusFood", to: "foodWastage", polarity: "+",
    explanation: "Unserved surplus becomes wastage.",
    evidence: "Mess-team interview: leftover food is \"thrown away\" or \"given to pig farms.\" Donating to orphanages was tried and stopped after spoilage during transport raised food-poisoning concerns.",
    strength: "interview-only",
  },
  {
    id: "E31a", from: "registrationSystemInput", to: "registrationVsConsumptionGap", polarity: "+",
    explanation: "More registrations (relative to actual eating) widens the gap.",
    evidence: "Student-side: 82.8% report plan changes after the cancellation cutoff (n=29); 88.9% report their allotted breakfast going unused/redirected (n=27). Mess-side: 62.9% of April's registered slots went unused (20,221 of 32,162).",
    strength: "strong",
  },
  {
    id: "E31b", from: "actualTurnout", to: "registrationVsConsumptionGap", polarity: "-",
    explanation: "Higher actual turnout narrows the gap — the other side of E31a's mechanism.",
    evidence: "Same figures as E31a.",
    strength: "strong",
  },
  {
    id: "E32", from: "registrationVsConsumptionGap", to: "surplusFood", polarity: "+",
    explanation: "The cross-subsystem bridge: unused registered meals were prepared for, and directly contribute to surplus on the mess side.",
    evidence: "Mess-side unused-slot figures (62.9%) are, by construction, prepared-for-but-unavailed volume — this is the same quantity viewed from the student/registration side (E31a/b) and the mess/surplus side (this link).",
    strength: "strong",
  },
  {
    id: "E33", from: "foodWastage", to: "preparationQuantity", polarity: "-",
    explanation: "Observed wastage becomes the input to the next preparation-quantity decision.",
    evidence: "Mess-team interview: \"the team uses this experience to reduce the quantity prepared the next time.\"",
    strength: "interview-only",
    delay: "Roughly one week later (next comparable same-weekday cycle) — not same-day. This is the loop's key delay.",
  },
  {
    id: "E34", from: "wastageRecordingQuality", to: "forecastAccuracy", polarity: "+",
    explanation: "More rigorous recording of leftovers would improve the precision of future estimates.",
    evidence: "Mess-team interview: leftover quantity is currently \"noted down\" or \"remembered/estimated,\" i.e. informal.",
    strength: "interview-only",
    flag: "Recording is currently informal, so this channel is a limiting factor today, not yet a strong positive one — the correction in E33 runs on a noisier signal than a logged wastage figure would give.",
  },
  {
    id: "E35", from: "holidayCampusAbsence", to: "forecastAccuracy", polarity: "-",
    explanation: "Holidays break the same-weekday historical baseline the mess relies on.",
    evidence: "Mess-team interview, Additional Information: \"preparation estimates often become inaccurate during holidays, because students may leave campus and go home.\"",
    strength: "interview-only",
  },
  {
    id: "E36a", from: "forecastAccuracy", to: "surplusFood", polarity: "-",
    explanation: "Better forecast accuracy reduces the odds of over-preparing.",
    evidence: "Logically entailed by projectedDemand/preparationQuantity being downstream of the historical-data-plus-experience process (E16–E20).",
    strength: "inferred",
  },
  {
    id: "E36b", from: "forecastAccuracy", to: "foodShortage", polarity: "-",
    explanation: "Better forecast accuracy also reduces the odds of under-preparing.",
    evidence: "Same basis as E36a.",
    strength: "inferred",
  },
  {
    id: "E37", from: "menuDraftingProcess", to: "menuAttractiveness", polarity: "+",
    explanation: "What coordinators/CDS/vendors jointly decide to serve sets the ceiling on how attractive a day's menu can be.",
    evidence: "Mess-team interview: the menu is drafted with involvement from student coordinators, CDS, and mess vendors.",
    strength: "interview-only",
    flag: "How their deliberation translates into \"attractiveness\" isn't itself observed — only the resulting dish-level avail-rate spread is (see E8).",
  },
  {
    id: "E38", from: "earlySlotPrevalence", to: "earlyMorningClass", polarity: "+",
    explanation: "A timetable with more early slots means more students have an early commitment on a given day.",
    evidence: "Spring 2026 timetable: 24 of 140 imported course-sections (17.1%) begin at 8:30 AM — the earliest and only slot before 10:05 AM — spread across all 6 weekdays in 3 day-groups (Mon/Thu, Tue/Fri, Wed/Sat).",
    strength: "strong",
    flag: "Timetable data cannot be linked to a specific survey respondent or mess-attendance record — no shared ID.",
  },
  {
    id: "E39", from: "classTimetableStructure", to: "earlySlotPrevalence", polarity: "+",
    explanation: "The timetable's own structure (as set by administration) determines how many early slots exist at all.",
    evidence: "Spring 2026 timetable structure itself — administratively fixed, independent of mess operations or student breakfast behaviour.",
    strength: "strong",
  },
  {
    id: "E40", from: "likelihoodOfSkipping", to: "postSkipCoping", polarity: "+",
    explanation: "Each time skipping happens and is followed by successfully eating elsewhere, the belief that skipping is low-cost gets behaviourally confirmed rather than contradicted — the closing link of R1.",
    evidence: "93.1% report buying/eating something else before lunch on a skip day — the coping belief is borne out in practice at a high rate, in the same sample that also holds the belief at 61%.",
    strength: "moderate",
    flag: "Cross-sectional co-occurrence, not a repeated-measures test of the belief strengthening after each individual skip — see R1's own flag.",
  },
]

export type LoopType = "R" | "B"

export interface Loop {
  id: string
  type: LoopType
  name: string
  /** Variable ids in cycle order — closes from the last entry back to path[0]. Empty for a loop that is not an actual closed cycle (B3). */
  path: string[]
  /** Polarity of each edge in the cycle, same length and order as path (edge i is path[i] → path[(i+1) % path.length]). */
  polarities: Polarity[]
  linkIds: string[]
  explanation: string
  evidence: string
  interpretation: string
  flag?: string
}

export const LOOPS: Loop[] = [
  {
    id: "R1",
    type: "R",
    name: "Low-Cost Skipping Reinforcement",
    path: ["likelihoodOfSkipping", "postSkipCoping", "motivationToEatBreakfast"],
    polarities: ["+", "-", "-"],
    linkIds: ["E40", "E10", "E11"],
    explanation:
      "Each time a student skips, the belief that skipping is low-cost (\"I'll just eat later\") gets behaviourally confirmed rather than contradicted — which strengthens the belief and further lowers the pull toward mess breakfast next time.",
    evidence:
      "61% agree/strongly agree that they can \"just eat something later\" after missing breakfast; 93.1% report actually doing so (buying/eating something else before lunch on a skip day) — the coping belief and the confirming behaviour are both present at high rates in the same sample.",
    interpretation:
      "This is the clearest candidate for a self-reinforcing student-side loop in the data. It amplifies rather than corrects: nothing in this cycle pulls skipping back down on its own.",
    flag:
      "The survey is a single cross-sectional snapshot, not a repeated-measures panel — we can show the belief and the behaviour co-occurring at the sample level, not that any individual's belief measurably strengthens after each skip. Treat this as theoretically coherent and evidence-consistent, not as a proven amplifying trend over time.",
  },
  {
    id: "B1",
    type: "B",
    name: "Mess Quantity Correction",
    path: ["preparationQuantity", "surplusFood", "foodWastage"],
    polarities: ["+", "+", "-"],
    linkIds: ["E22", "E30", "E33"],
    explanation:
      "When preparation runs ahead of turnout, the resulting surplus becomes wastage, and that wastage is the experience the mess team uses to pull the next comparable day's preparation quantity back down. Upstream, this same quantity is itself set from historicalAttendanceData → projectedDemand (E18, E20) — this is the tightest closed cycle within that larger forecasting chain.",
    evidence:
      "Mess-team interview, directly: \"when turnout is lower than expected... the excess food results in wastage,\" and \"the team uses this experience to reduce the quantity prepared the next time\" (Q8).",
    interpretation:
      "A genuine balancing loop — it works to close the gap between preparation and actual demand, not widen it. But its correction signal is currently noisy: wastage is recorded informally (noted/estimated, not measured), and the loop runs on a roughly weekly delay, so it can only correct after the fact, never in the moment it's needed.",
    flag:
      "The loop's calibration quality depends on wastageRecordingQuality, which is currently low — see the Delays section for why this matters.",
  },
  {
    id: "B2",
    type: "B",
    name: "Additional Batch Response",
    path: ["foodShortage", "additionalBatchesCooked"],
    polarities: ["+", "-"],
    linkIds: ["E26", "E29"],
    explanation:
      "When turnout runs ahead of preparation (actualTurnout is the external trigger, not part of the closed cycle itself), shortage pressure triggers cooking another batch — for items that allow it — which closes the gap the same day.",
    evidence:
      "Mess-team interview, directly: \"for food items that allow it, the team cooks additional batches to manage the increased demand\" (Q9).",
    interpretation:
      "A same-day, near-immediate balancing loop — in sharp contrast to B1's weekly delay. But it is structurally incomplete: it only exists for batch-cookable items (E27). For fully-advance-prepared items, there is no equivalent mid-service correction at all (E28) — the asymmetry the interview describes directly.",
  },
  {
    id: "B3",
    type: "B",
    name: "Cancellation Loop — Currently Absent",
    path: [],
    polarities: [],
    linkIds: [],
    explanation:
      "A well-functioning system would let a student's same-morning realization that they won't eat feed back into not preparing for that meal. That corrective path does not currently exist: the cancellation cutoff sits well before most students actually settle their plan, so registrationVsConsumptionGap just persists instead of closing.",
    evidence:
      "82.8% of students report their plan changes at least occasionally after it's already too late to cancel; 39% explicitly want more cancellation flexibility as an improvement; mess-side, 62.9% of April's registered slots went unused. Only 16.7% of conditional eaters say they decide the night before at all — most decide same-morning, while the cutoff is necessarily earlier than that.",
    interpretation:
      "Not a functioning balancing loop — a missing one. In systems terms, this is exactly the kind of gap a leverage point sits in: the structure to close registrationVsConsumptionGap is largely absent, not just weak, which is why the gap has stayed wide rather than self-correcting.",
    flag:
      "Deliberately has no drawn cycle — presented as a loop that should exist but structurally does not, rather than a working mechanism.",
  },
]

export interface Delay {
  id: string
  label: string
  description: string
  approxLength: string
}

export const DELAYS: Delay[] = [
  {
    id: "D1",
    label: "Wastage → next preparation quantity",
    description: "Today's surplus/wastage only informs the preparation decision for the next comparable same-weekday cycle, not today's remaining service.",
    approxLength: "~1 week",
  },
  {
    id: "D2",
    label: "Registration → actual turnout",
    description: "A student's registration commitment happens well ahead of the same-morning decision that actually determines whether they eat — the gap this creates is exactly what the (currently absent) cancellation loop, B3, would need to close.",
    approxLength: "Days to weeks ahead of the actual morning",
  },
  {
    id: "D3",
    label: "Shortage → additional batch",
    description: "In sharp contrast to D1, this correction is same-day and near-immediate — for batch-cookable items only.",
    approxLength: "Minutes, same service",
  },
  {
    id: "D4",
    label: "Holiday-driven forecast error → correction",
    description: "A holiday breaks the historical baseline for that specific date; there is no evidence the mess specifically adjusts its model for the next occurrence of that same holiday (vs. simply absorbing it as one-off noise in the general wastage-correction loop, B1).",
    approxLength: "Irregular — tied to the academic calendar, not a fixed cycle",
  },
]

export interface ExogenousFactor {
  id: string
  label: string
  description: string
  evidenced: boolean
}

export const EXOGENOUS_FACTORS: ExogenousFactor[] = [
  {
    id: "holidays",
    label: "Holidays / academic calendar",
    description: "Breaks the same-weekday historical baseline the mess's forecasting depends on.",
    evidenced: true,
  },
  {
    id: "timetable",
    label: "Class timetable structure",
    description: "Set by administration, independent of mess operations or breakfast behaviour — the Administration dashboard page itself states this data is never joined to survey/mess records.",
    evidenced: true,
  },
  {
    id: "menu-drafting-stakeholders",
    label: "Menu drafting deliberation (CDS, vendors, coordinators)",
    description: "We know who is involved; the deliberation itself (how dishes are actually chosen) is not observed.",
    evidenced: true,
  },
  {
    id: "mess-allocation-policy",
    label: "Automatic mess allocation policy",
    description: "34.5% of students rely at least partly on automatic allocation rather than choosing — an institutional policy input, not a student decision.",
    evidenced: true,
  },
  {
    id: "weather-events",
    label: "Weather, festivals, one-off campus events",
    description: "Plausible real-world influences on turnout that no current data source in this project actually measures.",
    evidenced: false,
  },
]
