# Breakfast Paradox Survey — Question Map & Research Analysis

Generated from the live codebase, refreshed to match the current build (includes the food-quality, motivation, and value-perception questions, plus the attention check and hunger-row clarification added in the last round). Covers the full flow: Consent → About You → Usual Routine → Breakfast Routine (Branch A/B/C) → After Your Morning Routine → Exit.

*Counting convention: an "Other" free-text reveal is treated as part of its parent question, not counted separately — same convention used throughout Part 1 and the count table below.*

---

## Part 1 — Complete Question Map

### 0. Consent (`/`)

Not a data question — a gate.

- Checkbox: "I have read the information above and agree to participate in this survey." **Required to continue.** Not persisted to state.
- Secondary link: "I don't want to participate" → `/exit`.

### 1. About You (`/about-you`)

| # | Question | Type | Options | Required | Field(s) |
|---|---|---|---|---|---|
| 1 | Which program are you currently enrolled in? | Searchable single-select + Other | Program list + "Other" | Yes | `program`, `programOther` |
| 2 | Which year of your program are you currently in? | Single-select | 1st–5th year or above, Other/Not applicable | Yes | `year` |
| 3 | Which hostel do you currently stay in? | Single-select | Bakul, Parijat, OBH, Kadamba | Yes | `hostel` |
| 4 | What is your gender? | Single-select | Woman, Man, Non-binary/another identity, Transgender Man, Transgender Woman, Prefer not to say | **No** | `gender` |
| 5 | In a typical week, on how many days do you have a class, meeting, lab, or other mandatory activity starting before 9:00 AM? | Single-select | 0–4 days, 5+ days | Yes | `earlyCommitmentDays` |

### 2. Usual Routine (`/usual-routine`)

| # | Question | Type | Options | Required | Field(s) | Shown when |
|---|---|---|---|---|---|---|
| 1 | Around what time do you usually go to sleep? | Time range (weekday+weekend) | Before 11pm → After 3am, No consistent time | Yes | `sleepTimeWeekday/Weekend` | always |
| 2 | What do you usually spend time doing in the hours before you go to sleep? *(select all)* | Multi-select + Other | Studying, project work, internship/work, club activities, friends, content/gaming/social, late-night eating, exercise, personal tasks, Other | Yes | `beforeSleepActivities`, `beforeSleepActivityOther` | always |
| 3 | Which of these usually takes up most of your time before you sleep? | Single-select (options = Q2's picks) | — | Yes | `beforeSleepMostTime` | Q2 has ≥1 selection |
| 4 | Around what time do you generally wake up in the morning? | Time range (weekday+weekend) | Before 6:30am → After 10am, No consistent time | Yes | `wakeTimeWeekday/Weekend` | always |
| 5 | On a typical weekday, which of the following are usually part of your morning after you wake up? *(select all)* | Multi-select + Other | Check phone, get ready, study/work, exercise, go to mess, eat in room, buy/order elsewhere, go to class, go back to sleep, Other | Yes | `morningActivities`, `morningActivityOther`, `morningActivityOrder` | always |
| 5a | Arrange these in the order they normally happen. | Rank/reorder list | (Q5's picks) | No | `morningActivityOrder` | Q5 has ≥2 selections |
| 6 | How is the mess for your breakfast usually decided? | Single-select | Self-registered, auto-allotted, mixed, not sure | Yes | `messDecision` | always |
| 6a | How would you rate the food quality of the breakfast served at your mess? | Single-select | Very good → very poor, not enough experience | Yes | `messFoodQuality` | always |
| 6b | How often does your breakfast plan change after it is already too late to cancel that meal? | Single-select | Almost always → Never | Yes | `breakfastPlanChangeFrequency` | always |
| 6c | When that happens, what do you usually do? *(select all)* | Multi-select + Other | Still use it, exchange, sell, give away, buy others' meal, eat elsewhere, order online, leave unused, skip, Other | Yes | `breakfastPlanChangeActions`, `breakfastPlanChangeActionOther` | 6b ≠ "never" |
| 6d | When you try to sell/exchange/give away your breakfast, how often can you find someone to take it? | Single-select | Almost always → Never | Yes | `breakfastResaleSuccessRate` | 6c shown **and** includes sell/exchange/give-away |
| 7 | **In a typical week, how often do you usually eat breakfast at the mess?** | Single-select | Almost every day, Most days, Some days, Rarely, Never | Yes | `breakfastFrequency` | always — **this is the branch trigger** |

### 3. Breakfast Routine (`/breakfast-routine`) — branches on Q7 above

**Branch A — regular eaters** (`almost-every-day` / `most-days`)

| # | Question | Type | Options | Required | Field(s) | Shown when |
|---|---|---|---|---|---|---|
| A1 | Around what time do you usually go to the mess for breakfast? | Single-select | Before 7:30am → 9:30am, varies a lot | Yes | `messBreakfastTime` | always (branch) |
| A2 | At what point in your morning do you usually have breakfast? | Single-select + Other | Before/after getting ready, on the way, just before/after commitment, no fixed point, Other | Yes | `breakfastMoment`, `breakfastMomentOther` | always (branch) |
| A3 | Around how much time does your usual breakfast routine take (mess → eat → leave)? | Single-select | <10min → >30min, varies a lot | Yes | `breakfastRoutineDuration` | always (branch) |
| A4 | On early-class days, do you usually change your routine to make time for breakfast? | Single-select | Yes / No / Sometimes | Yes | `earlyClassRoutineChange` | always (branch) |
| A5 | If yes, what do you usually change? *(select all)* | Multi-select + Other | Wake earlier, get ready faster, less time on other activity, go earlier, eat quicker, choose convenient mess, Other | Yes | `earlyClassRoutineChangeActions` + Other | A4 = yes/sometimes |
| A6 | Are there days you intend to have breakfast but end up missing it? | Single-select | Often → Never | Yes | `missedBreakfastFrequency` | always (branch) |
| A7 | What usually happens on those days? *(select all)* | Multi-select + Other | Woke later, earlier commitment, less time, not hungry, don't like menu, mess allocation issue, plans changed, ate elsewhere, Other | Yes | `missedBreakfastReasons` + Other | A6 ≠ "never" |
| A8 | If the mess you're allotted isn't the one you want, what do you usually do? *(select all)* | Multi-select + Other | Cancel, exchange, sell, give away, buy others' meal, eat elsewhere, leave unused, skip, Other | Yes | `unwantedMessActions` + Other | always (branch) |
| A9 | Do you usually have breakfast at the same allotted mess? | Single-select | Yes almost always / changes sometimes / changes frequently | Yes | `messConsistency` | always (branch) |
| A10 | If it changes, what usually determines where you eat? *(select all)* | Multi-select + Other | Allocation, menu, proximity, friends, queue, timing, Other | Yes | `messChangeDeterminants` + Other | A9 ≠ "almost always" |
| A11 | How would you describe breakfast in your usual morning routine? | Single-select + Other | Actively plan, automatic part, depends on day, decide in moment, Other | Yes | `breakfastRoutineDescription` + Other | always (branch) |
| A12 | On the days when you do have breakfast at the mess, what usually makes you decide to go? *(select all)* | Multi-select + Other | Feel hungry, part of routine/habit, already paid for it, going with friends, menu that day, time before commitment, helps focus/energy, Other | Yes | `breakfastMotivationFactors` + Other | always (branch) |

**Branch B — conditional eaters** (`some-days`)

| # | Question | Type | Options | Required | Field(s) | Shown when |
|---|---|---|---|---|---|---|
| B1 | On days you have breakfast at the mess, around what time do you usually go? | Single-select | Same time bands as A1 | Yes | `conditionalMessBreakfastTime` | always (branch) |
| B2 | At what point do you usually decide whether you'll eat breakfast that day? | Single-select | Previous night → varies, no conscious decision | Yes | `breakfastDecisionPoint` | always (branch) |
| B3 | What's usually different on the days you eat breakfast vs. don't? *(select all)* | Multi-select + Other | Sleep, wake time, first-class time, morning time, menu, allocation, hunger, friends, queue, distance, ate-late-previous-night, unexpected plans, Other | Yes | `breakfastDayDifferentiators` + Other | always (branch) |
| B4 | How often do you plan to eat breakfast but end up not going? | Single-select | Often → Never | Yes | `breakfastPlannedButSkippedFrequency` | always (branch) |
| B5 | How often do you initially not plan to, but end up going anyway? | Single-select | Often → Never | Yes | `breakfastUnplannedButWentFrequency` | always (branch) |
| B6 | What usually makes your breakfast plan change? *(select all)* | Multi-select + Other | Woke different than expected, time different than expected, schedule changed, hunger different, menu, mess allocation, friends' plans, ate late previous night, unexpected event, Other | Yes | `breakfastPlanChangeReasons` + Other | B4 or B5 ≠ "never" |
| B7 | On the days when you do have breakfast at the mess, what usually makes you decide to go? *(select all)* | Multi-select + Other | Feel hungry, part of routine/habit, already paid for it, going with friends, menu that day, time before commitment, helps focus/energy, Other | Yes | `breakfastMotivationFactors` + Other | always (branch) |

**Branch C — rare/non-eaters** (`rarely` / `never`)

| # | Question | Type | Options | Required | Field(s) | Shown when |
|---|---|---|---|---|---|---|
| C1 | During the time breakfast is usually served, what are you most often doing? | Single-select + Other | Sleeping, getting ready, travelling, already in class, studying/working, exercising, something else | Yes | `breakfastServedTimeActivity` + Other | always (branch) |
| C2 | Is not going a conscious decision, or does it just not become part of your routine? | Single-select | Decide not to go / not part of routine / depends / haven't thought about it | Yes | `breakfastAbsenceReason` | always (branch) |
| C3 | At what point do you usually know you won't go to the mess for breakfast? | Single-select | Previous night → varies, no conscious decision | Yes | `breakfastAbsenceDecisionPoint` | always (branch) |
| C4 | Are there situations when you do end up having breakfast at the mess? | Single-select | Yes sometimes / very rarely / never | Yes | `occasionalBreakfastFrequency` | always (branch) |
| C5 | If yes, what's usually different on those days? *(select all)* | Multi-select + Other | More time, woke earlier, no early commitment, menu wanted, felt hungry, friends going, different mess allocation, Other | Yes | `occasionalBreakfastDifferentiators` + Other | C4 ≠ "never" |
| C6 | On the days when you do have breakfast at the mess, what usually makes you decide to go? *(select all)* | Multi-select + Other | Feel hungry, part of routine/habit, already paid for it, going with friends, menu that day, time before commitment, helps focus/energy, Other | Yes | `breakfastMotivationFactors` + Other | C4 ≠ "never" (same gate as C5 — skipped entirely for respondents who never eat breakfast) |
| C7 | When you don't use a registered/allotted breakfast, what usually happens to it? *(select all)* | Multi-select + Other | Sell, exchange, give away, leave unused, try-to-transfer-sometimes-can't, not sure, Other | Yes | `unusedAllottedMealActions` + Other | always (branch) |
| C8 | Have there been times you used to eat breakfast more often than now? | Single-select | Yes / No / Not sure | Yes | `breakfastFrequencyChanged` | always (branch) |
| C9 | If yes, what changed? | Open text | — | Yes | `breakfastFrequencyChangeDescription` | C8 = "yes" |

### 4. After Your Morning Routine (`/after-morning-routine`)

| # | Question | Type | Options | Required | Field(s) | Shown when |
|---|---|---|---|---|---|---|
| 1 | On days you don't eat breakfast at the mess, what do you usually do before lunch? | Single-select + Other | Eat in room, buy from canteen, order online, eat elsewhere on campus, wait until lunch, varies, Other | Yes | `nonBreakfastMealSource` + Other | always |
| 2 | Around what time do you usually have your next food/drink (other than water)? | Single-select | Before 10am → after lunch, varies a lot | Yes | `nextFoodTime` | always |
| 3 | On early-commitment days, how often do you eat breakfast at the mess? | Single-select | Almost always → Never, Not applicable | Yes | `earlyCommitmentBreakfastFrequency` | always |
| 4 | On non-early-commitment days, how often do you eat breakfast at the mess? | Single-select | Almost always → Never | Yes | `noEarlyCommitmentBreakfastFrequency` | always |
| 5 | Compared with weekdays, how often do you eat breakfast on weekends? | Single-select | More often / about the same / less often / rarely-never either | Yes | `weekendBreakfastComparison` | always |
| 6 | What's usually different about your weekends? *(select all)* | Multi-select + Other | Sleep later, wake later, fewer commitments, more morning time, different food plans, different friend plans, Other | Yes | `weekendDifferentiators` + Other | Q5 = more/less often |
| 7 | How often do you spend money on food before lunch on non-breakfast days? | Single-select | Never → Almost always | Yes | `nonBreakfastSpendingFrequency` | always |
| 8 | Approximately how much do you usually spend before lunch on those days? | Single-select | Under ₹50 → >₹150, varies a lot | Yes | `nonBreakfastSpendingAmount` | Q7 ≠ "never" |
| 9 | Compared with the start of this semester, has your breakfast frequency changed? | Single-select | More now / same / less now / back-and-forth / not sure | Yes | `semesterBreakfastChange` | always |
| 10 | What changed around the same time? | Open text (multi-line) | — | Yes | `semesterBreakfastChangeDescription` | Q9 = more/less/back-and-forth |
| 11 | Compared with days you eat breakfast, how do you feel before lunch on days you don't? | Rating grid: energy, concentration, hunger | Much lower → much higher, can't compare | Yes | `comparisonRatings` | branch-dependent (see below) |
| 12 | Does what happened the previous night affect whether you have breakfast? | Single-select | Yes often / sometimes / rarely / never / depends | Yes | `previousNightAffectsBreakfast` | always |
| 13 | What usually affects that decision? *(select all)* | Multi-select + Other | Ate late, ordered food/canteen, wake hungry/not, felt low energy after skipping, had to buy food later, next-morning schedule, Other | Yes | `previousNightFactors` + Other | Q12 = yes-often/sometimes/rarely |
| 14 | How much do the following usually affect whether you eat breakfast? | Rating grid, **15 rows** (sleep, first-class time, morning time, serving time, menu, mess allocation, distance, **embedded attention check**, queue, friends, waking hunger, ate-late-previous-night, canteen availability, online ordering, resale ability) | Not at all → Very strongly | Yes | `influenceRatings` | always |
| 15 | Of those, which has the biggest influence? | Single-select (= Q14's rows, **attention-check row excluded**, so 14 options) | — | Yes | `biggestInfluenceFactor` | always |
| 16 | Thinking about how often you actually use your registered/allotted breakfast, how do you feel about what you pay for it? | Single-select | Good value, okay/not every time, somewhat wasteful, very wasteful, not sure how cost works, not applicable | Yes | `mealValuePerception` | always |
| 17 | How much do you agree with the following? | Rating grid, 9 statements (sleep-over-breakfast, eat-later-instead, class-on-time-over-breakfast, already-paid-use-whenever, resale-reduces-concern, planned-in-advance, depends-on-morning, no-hunger-no-reason, inconvenient-eat-later) | Strongly disagree → strongly agree | Yes | `agreementRatings` | always |
| 18 | Which would make it easier to have breakfast more regularly? *(select up to 3)* | Multi-select (capped at 3) + Other | Better timing, faster options, better menu, easier mess changes, more cancel flexibility, official exchange system, shorter queues, closer breakfast, fewer early commitments, nothing would change it, Other | Yes | `breakfastImprovementOptions` + Other | always |
| 19 | If you could change one thing about the breakfast system, what and why? | Open text (multi-line) | — | Yes | `breakfastSystemChangeSuggestion` | always |

*Q11's visibility: Branch B → always shown; Branch A → shown only if `missedBreakfastFrequency` is "sometimes"/"rarely"; Branch C → shown only if `occasionalBreakfastFrequency` ≠ "never". Its "Hunger" row now carries a clarifying caption ("'Higher' means feeling hungrier than usual — not necessarily worse, just different") to disambiguate direction against the Energy/Concentration rows, where higher is unambiguously better.*

### 5. Exit (`/exit`)

Thank-you screen only. No data collected.

---

## How many questions does each respondent actually see?

This is where "one survey" is misleading — the branch means Branch A, B, and C respondents each answer a genuinely different-length survey, and several within-branch questions only appear depending on how they answer. The table below counts every screen a respondent could see, split into **always-shown** (guaranteed, no matter what they answer) and **conditional** (appears only for some answer patterns), and gives the resulting min–max range. Conditional questions where the "Other" free-text reveal exists are still counted as one question, per the convention above.

| Section | Always shown | Conditional (may or may not appear) | Range |
|---|---|---|---|
| About You | 5 | 0 | **5** (fixed) |
| Usual Routine | 9 *(includes Q3, which is nominally conditional on Q2 having ≥1 pick — but Q2 itself requires ≥1 pick to submit, so Q3 is guaranteed in practice)* | Q5a (rank order, needs ≥2 picks in Q5), 6c (plan-change actions), 6d (resale success) | **9 – 12** |
| Breakfast Routine — Branch A | 9 (A1,A2,A3,A4,A6,A8,A9,A11,A12) | A5, A7, A10 | **9 – 12** |
| Breakfast Routine — Branch B | 6 (B1,B2,B3,B4,B5,B7) | B6 | **6 – 7** |
| Breakfast Routine — Branch C | 6 (C1,C2,C3,C4,C7,C8) | C5+C6 (always appear together, same gate), C9 | **6 – 9** |
| After Your Morning Routine — seen by Branch A | 14 | Q6, Q8, Q10, **Q11**, Q13 | **14 – 19** |
| After Your Morning Routine — seen by Branch B | 15 *(Q11 is unconditional for Branch B)* | Q6, Q8, Q10, Q13 | **15 – 19** |
| After Your Morning Routine — seen by Branch C | 14 | Q6, Q8, Q10, **Q11**, Q13 | **14 – 19** |

### Total per respondent (About You + Usual Routine + their branch + After Your Morning Routine)

| Respondent path | Minimum | Maximum |
|---|---|---|
| **Branch A** (almost every day / most days) | **37** | **48** |
| **Branch B** (some days) | **35** | **43** |
| **Branch C** (rarely / never) | **34** | **45** |

A few things worth knowing about that range:
- The gap between min and max within a single branch (9–13 questions) is almost entirely driven by **whether prior answers open up follow-ups** — e.g., someone who says their breakfast plan "never" changes skips two questions in Usual Routine; someone who says it changes "often" and that they resell meals answers both.
- **Branch B respondents see the fewest questions overall** even though their own branch page is the shortest (6–7), because Branch B is the only branch for which the After-Morning-Routine comparison grid (Q11) is *unconditional* — they always see it, so their "always shown" floor there is one higher than Branch A/C's, but their branch-page floor is enough lower that their total floor still comes out lowest.
- **Branch A tends to run longest**, since it's the only branch with 3 independently-triggerable conditionals (A5, A7, A10) stacked on top of an already-longer always-shown set (9 vs. 6 for B/C).
- These ranges don't include the consent checkbox or the exit screen (neither collects a real answer), and don't count "Other" free-text reveals as separate questions.

---

## Part 2 — Coverage Analysis: Is This Enough to Understand the System?

Framed against the four things you named — **patterns, events, structure, mental models** — plus the survey's own premise (a "paradox": a resourced system that students still don't reliably use).

### What's strongly covered

- **Structure (institutional mechanics)** — this is the best-instrumented dimension. Mess allocation/registration (`messDecision`), consistency of allocation (`messConsistency`/`messChangeDeterminants`), and the full disposal path for an unused meal (cancel/exchange/sell/give-away/leave-unused, in *three* separate places: usual-routine Q8, Branch A Q8/A10, Branch C Q6) are all captured with real granularity.
- **Events (situational disruption)** — early-class conflicts, plan-changes-too-late-to-cancel, missed-intent days, and previous-night spillover are each asked from multiple angles across branches. This is genuinely thorough triangulation of "what breaks the routine on a given day."
- **Patterns (temporal structure)** — sleep/wake times, weekday-vs-weekend comparison, and semester-over-time trend give you three independent time axes to segment on, plus the mandatory-commitment cross-cut from About You.
- **Mental models (partial)** — `breakfastRoutineDescription` (Branch A) and `breakfastAbsenceReason` (Branch C) directly probe *how students frame their own behavior* (planned vs. automatic vs. decided-against vs. never-considered), and the 9-statement agreement block adds attitudinal texture (sunk-cost, competing priorities, hunger-as-trigger).

### Gaps worth considering

Originally six content gaps were flagged. Three were implemented; three were deliberately dropped — students taking this survey have no visibility into official institutional mechanics, so questions assuming that knowledge would just measure confusion, not signal.

**Implemented:**

1. ~~No direct motivation-to-eat question~~ → **Added**: "On the days when you do have breakfast at the mess, what usually makes you decide to go?" (multi-select + Other), asked at the end of each branch on `/breakfast-routine` — always for Branch A/B, gated on `occasionalBreakfastFrequency ≠ "never"` for Branch C. Field: `breakfastMotivationFactors`.
2. ~~No perceived-value/fairness question~~ → **Added**: "Thinking about how often you actually use your registered/allotted breakfast, how do you feel about what you pay for it?" on `/after-morning-routine`, right before the agreement-statements grid. Field: `mealValuePerception`.
3. ~~No food-quality/satisfaction question~~ → **Added**: "How would you rate the food quality of the breakfast served at your mess?" on `/usual-routine`, right after the mess-decision question. Field: `messFoodQuality`.

**Deliberately dropped** (students wouldn't have the context to answer meaningfully):

4. ~~No single "waste" roll-up metric~~ — not added. A direct "how many breakfasts go unused" count risks students guessing rather than reporting something they've actually tracked; the existing frequency + action questions still let you *infer* it.
5. ~~No system-literacy check~~ — not added. Asking whether students know an "official" cancel/transfer process assumes such a process is legible to them in the first place, which isn't something this survey can safely presume.
6. ~~No social-norms question~~ — not added, per the same reasoning: students' *perception* of what "most students" do is speculation, not a system fact.

**Methodological fixes applied:**

7. **Attention check.** A row reading *"To show you're reading each row, please select 'A lot' for this one"* is now embedded mid-way through the 14→**15**-row influence grid (`INFLUENCE_FACTOR_ITEMS`, key `attentionCheckInfluence`, expected value `"a-lot"` — both exported from `lib/survey-options.ts` for use during analysis). It's still required to answer like any other row — no value is enforced at submission time, since flagging low-attention responses is an analysis-time concern, not a UX gate. It's excluded from Q15's "biggest influence" options, since it isn't a real factor.
8. **Hunger-row semantic ambiguity.** The "Hunger" row in the before/after comparison grid (Q11) now carries a clarifying caption, since "higher" hunger is a worse outcome (the opposite direction from Energy/Concentration, where higher is better) — see the footnote below the Q11 row.
9. **Single time-point, retrospective self-report only** — unchanged, a structural limitation of any one-shot survey, not fixable by adding a question. If budget allows, a short follow-up (a diary study, or linking to actual mess swipe/allocation-change logs) would let you validate self-report against real behavior.

None of this means the instrument is inadequate — it's unusually well cross-triangulated for something built this iteratively. The additions sharpen the "paradox" framing (motivation, value perception, food quality) without asking students to speak to system mechanics they have no way of actually knowing.

---

## Part 3 — Supabase Data Mapping

The app currently keeps everything in one `sessionStorage` blob shaped like `{ aboutYou, usualRoutine, afterMorningRoutine }` (branch A/B/C fields all live flat inside `usualRoutine`). Moving that to Supabase needs a few decisions:

### 1. Respondent identity (anonymity is a hard constraint)

The consent screen promises no name/email is collected — the schema has to hold that line. Generate a random UUID client-side at consent time (not derived from anything identifying), store it in `localStorage` (survives reload, not shared across devices), and use it as the sole respondent key. Don't log IP address or other fingerprinting alongside responses unless it's explicitly for duplicate-detection and kept separate from anything joinable to answer content.

```sql
create table respondents (
  id uuid primary key,             -- client-generated
  created_at timestamptz default now(),
  completed_at timestamptz,
  survey_version text not null     -- see §5
);
```

### 2. Answer storage: JSONB blob vs. normalized (EAV) — recommend a hybrid

**Option A — one JSONB column per section** (closest to the current app shape, least remapping):

```sql
create table survey_responses (
  respondent_id uuid primary key references respondents(id),
  about_you jsonb,
  usual_routine jsonb,        -- includes all Branch A/B/C fields flatly, as today
  after_morning_routine jsonb,
  updated_at timestamptz default now()
);
```
Fast to ship — the client just PUTs its existing state objects. Downside: analysts need JSON-path queries (`usual_routine->>'breakfastFrequency'`) for everything, and there's no enforced link between a field and what question it means.

**Option B — normalized long format** (better for analysis at scale):

```sql
create table survey_answers (
  respondent_id uuid references respondents(id),
  question_key text not null,       -- e.g. "breakfastFrequency"
  section text not null,            -- "about_you" | "usual_routine" | "breakfast_routine" | "after_morning_routine"
  branch text,                      -- "A" | "B" | "C" | null
  value_text text,                  -- scalar answers
  value_array text[],               -- multi-select answers
  value_json jsonb,                 -- rating grids (Record<string,string>)
  created_at timestamptz default now(),
  primary key (respondent_id, question_key)
);
```
Lets you answer "how many people picked X" or "average rating on row Y" with plain SQL, no JSON parsing, and new questions don't require a migration. Cost: the client has to flatten its local state into rows on submit (a small, mechanical mapping function).

**Recommendation:** ship Option A first (fast, unblocks data collection now), and add a materialized view or nightly job that flattens it into Option B's shape for analysis once you're actually querying the data — you get both without double-building upfront.

### 3. A question dictionary (this doc, formalized as data)

Whichever storage shape you pick, analysts need a lookup table describing what each `question_key` *means* — otherwise Part 1 of this doc is the only place that knowledge lives. Turn it into a `question_dictionary` table (or a versioned JSON file checked into the repo, e.g. `lib/question-dictionary.ts`) with one row per field: `question_key, section, branch, question_text, input_type, options (jsonb), required`. This is exactly the table in Part 1 — generate it from `lib/survey-options.ts` + the `RequiredFieldKey` unions so it can't drift from the actual app.

### 4. Handling the branch structure

Branch A/B/C fields all live in one `usual_routine` object with most fields blank for two of the three branches. When querying, always filter by `breakfast_frequency` (or a derived `branch` column, `'A'|'B'|'C'`, computed once at write time) rather than by "is this field non-null," since a blank *is* meaningful (branch didn't ask it) but so is a genuinely-skipped-but-should-have-been-answered field if validation ever has a bug. Store the derived branch letter explicitly — don't make analysts re-derive it from `breakfastFrequency` every time.

### 5. Field-type handling

Four distinct shapes need distinct treatment wherever they land:
- **Scalar single-select** → plain text/enum column or `value_text`.
- **Multi-select** → `text[]` or `value_array`; the paired "Other" free-text field should be a *separate* column/row (`..._other`), not concatenated into the array.
- **Rating grids** (`comparisonRatings`, `influenceRatings`, `agreementRatings`) → `Record<row_key, scale_value>`; store as JSONB, or — for Option B — one row per grid *cell* (`question_key = "influenceRatings.sleepAmountInfluence"`), which makes per-row analysis trivial at the cost of more rows.
- **Open text** → plain text column, obviously, but worth running these through basic PII scrubbing/review before analysis given the "anonymous" promise — a free-text box is the one place a student could accidentally identify themselves.

### 6. Partial completion / funnel analytics

The app already persists on every keystroke client-side. If the goal includes measuring *where people drop off* (a genuinely useful "system" question — is the survey itself part of the paradox?), sync to Supabase incrementally (debounced upsert per section on blur/navigation) rather than only on final submit, and add a per-section `reached_at` timestamp so you can build a funnel: consent → about-you → usual-routine → branch → after-morning-routine → completed.

### 7. Versioning

The question set has changed multiple times in this session alone. Before this goes live for real respondents, freeze a `survey_version` (e.g. semantic string or date-stamped tag) and stamp every respondent row with it at consent time. If questions/options change later, bump the version rather than mutating history — otherwise cross-respondent comparisons silently mix incompatible question sets.

### 8. Row Level Security posture

Anonymous respondents should be able to **insert** their own row (matched to the client-held UUID) and **update it only until `completed_at` is set** — never read or update anyone else's, never read back after completion (prevents tampering and answer-fishing). A service role (server-side only) handles all analytical reads. This is a standard "write-only from the client, read-only from the backend" RLS pattern in Supabase.
