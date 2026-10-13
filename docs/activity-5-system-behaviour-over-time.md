# Activity 5: Analyse System Behaviour Over Time

**Purpose:** identify how individual decisions accumulate and create system-level outcomes — by collecting historical records, developing a timeline, and examining recurring patterns, significant changes, and feedback loops.

**Data snapshot:** n = 29 completed student responses. Every figure below is reused directly from the existing Events, Patterns, Structures, and Mental Models analysis — nothing here is a new calculation, and no historical or mock data has been invented to fill a gap.

> **Activity status: In progress.** Student behaviour evidence and mess operational data (registered/availed swipe records, the April menu, and a mess-team interview) are now available. Administration research (scheduling rationale and constraints) is still pending — the complete system-level behaviour-over-time analysis can only be produced once it arrives. What follows documents what student and mess data can already support, and clearly marks what can't be completed yet.

---

## 1. System Timeline

A single day's sequence, previous night through the following night. Each stage shows the strongest student-side evidence that speaks to it. A stage with no matching survey question is left empty rather than guessed.

### Previous night
*Sleep timing the night before, and whether it carries into the next morning.*

- Early sleepers have a regular-breakfast rate **85.7 percentage points** higher than late sleepers. *(n = 14, small sample — between-group association, Patterns)*

### Morning routine
*How deliberate or automatic the decision to eat (or not) usually is.*

- The most common breakfast routine mindset is **"It's a habit / automatic"** (**50%**, regular and rare/non-eaters only). *(n = 20, small sample — self-report, Mental Models)*

### Breakfast window
*What actually happens at the mess, and how the registration system runs.*

- **69%** of students don't eat breakfast at the mess every day. *(n = 29 — direct self-report, Events)*
- **82.8%** of students say their breakfast plan changes at least occasionally after it's too late to cancel. *(n = 29 — direct self-report, Structures)*
- **34.5%** of students rely at least partly on automatic mess allocation rather than choosing it themselves. *(n = 29 — direct self-report, Structures)*
- **88.9%** of students report their allotted breakfast going unused or redirected to someone else. *(n = 27 — direct self-report, Events)*
- The most common view of the mess fee's breakfast value is **"It feels very wasteful — I rarely get value from it"** (**31%**). *(n = 29, small sample — attitudinal self-report, Mental Models)*

### Early classes
*How early academic commitments compete with the breakfast window.*

- **32.1%** of students eat breakfast less often on days with an early commitment than on their own non-early days. *(n = 28 — within-person association, Patterns)*
- **72.4%** of students rate "Time of my first class/meeting" as a strong influence on their breakfast decisions — the highest-rated structural factor. *(n = 29 — direct self-report, Structures)*

### Later morning
*What students do for food after a skipped mess breakfast.*

- **93.1%** of students buy or eat something else before lunch on days they skip the mess breakfast. *(n = 29 — direct self-report, Events)*

### Rest of day
*Self-reported downstream effects on days breakfast was skipped, on a -2 (much lower than usual) to +2 (much higher) scale.*

- Energy level before lunch: average position **-0.57** (lower than usual). *(n = 23 — reported comparison, Events)*
- Ability to concentrate before lunch: average position **-0.23** (lower than usual). *(n = 23 — reported comparison, Events)*
- Hunger before lunch: average position **+0.41** (higher than usual). *(n = 23 — reported comparison, Events)*

### Following night
*Whether a day's breakfast behaviour carries into the next cycle.*

- **No evidence yet.** The current student survey has no question that connects a specific day's breakfast decision to that same night's routine — this stage is left empty rather than inferred.

---

## 2. Recurring Patterns — Student Evidence

The strongest recurring findings already established on Patterns, Structures, and Mental Models, synthesized here rather than duplicated. Full detail lives on those pages.

| Finding | Value | n | Evidence type | Source |
|---|---|---|---|---|
| Students eat breakfast more often on weekends than weekdays | 13.8% | 29 | Reported comparison | Patterns |
| Most widely held belief: "Rest is a priority" | 86.2% agree | 29 | Attitudinal (self-report) | Mental Models |
| Most commonly requested change: "Breakfast timings that fit my schedule better" | 55.2% *(small sample)* | 16 | Direct self-report | Structures |
| Breakfast less often on early-commitment days (within-person) | 32.1% | 28 | Within-person association | Patterns |
| Plan changes at least occasionally after the cancellation cutoff | 82.8% | 29 | Direct self-report | Structures |

---

## 3. Mess Behaviour Over Time — Now Available

The mess provided a full April export (registrations + swipe-in timestamps, `data/april-data-clean.csv`), the April breakfast menu (`data/kadamba-breakfast-menu-april-2026.csv`), and a mess-team interview. All three are live on the **Mess Attendance** dashboard page; summarized here rather than duplicated.

- **Registered vs. availed over time** — **available.** April 2026: 32,162 registered breakfast slots, 11,941 availed (**37.1% avail rate**), i.e. 20,221 registered slots went unused across the month. This is the direct, mess-side counterpart to the 82.8%/88.9% student self-report figures in §3 above — actual unused volume, not just self-reported likelihood. *(n = 32,162 slot-records, April 2026 — Mess Attendance)*
- **Breakfast availment by time** — **available.** Swipe-in scans cluster tightly between ~06:00 and 10:00, with the single busiest 10-minute window at **09:20** (2,365 scans). This matches the mess team's own account below almost exactly (arrivals rising from 8:00–8:30, peak "around 9:00 AM") — a rare case of independent qualitative and quantitative evidence agreeing. *(n = all April scans — Mess Attendance)*
- **Menu ↔ avail rate** — **available**, and new since the mess data arrived. Joining the April menu to daily avail rate shows a real spread by main dish: **Mysoore Bonda** highest at 45.5% avail rate, **Wheat Upma** lowest at 25.4% (n = 1 day each, so treat as suggestive). *(Mess Attendance — "Avail rate by main dish")*
- **Mess qualitative findings** — **available**, full interview below (§3a).

### 3a. Mess Operations Interview (mess team, one round of questions)

*Single-source interview with the mess team — not yet triangulated against a second staff perspective, so treat as one team's account, not confirmed institutional policy.*

**Preparation & planning**
- Breakfast prep begins at **6:00 AM**; service itself is unchanged at **7:30–9:30 AM**.
- Quantity is set from **historical mess-portal data + projections**, topped up with staff experience/estimation — not real-time demand signals.
- The menu is drafted jointly by **student coordinators, CDS, and mess vendors**; the mess team alone sets preparation *quantity*, using the prior week's same-weekday figures as the baseline.
- **Holidays break the forecasting model** — students leave campus, so historical same-weekday quantities stop being a reliable baseline.

**Demand variation**
- The team reports attendance depends more on **which dish is served** than on which weekday it is — citing bonda, vada, and muesli as draws.
- Cross-check against the actual April data: **Mysoore Bonda** was in fact the best-attended dish (45.5%), supporting the "bonda draws students" claim. **Wada**, however, sits mid-table (39.6% avail rate, 5th of 11 dishes) — served 5 times in April but not the standout the interview suggests. Muesli only appears in the menu export as a cereal side item, never as `dish1`, so it can't be checked the same way. **Read this as a partial confirmation, not a full one** — the mess team's lived sense of "popular items" and what the swipe data actually shows don't fully line up, which is itself a system-behaviour finding (see §6).

**Waste handling**
- Leftover food is generally **thrown away or sent to pig farms**. Donating to orphanages was tried once or twice and **stopped after spoilage during transport caused food-poisoning concerns** — a safety-driven policy change, not a cost or preference one.
- Leftover quantity is **recorded informally** — noted down or estimated from memory, not measured systematically.

**Operational flexibility**
- Some items are **batch-cookable during service** (can scale up if turnout is higher than expected); others must be **fully prepared in advance**, creating a fixed-supply constraint that can't be adjusted once service starts.
- **Asymmetric response to demand surprises**: when turnout is *higher* than expected, batch-cookable items can be scaled up. When turnout is *lower* than expected, the excess is simply wasted — there is no equivalent downward lever mid-service. The team's only response is to **prepare less next time**, based on that experience.

---

## 4. Administration Evidence — Pending Research

- **Awaiting administration research.** Will cover how class schedules are decided, why early classes exist, scheduling constraints and dependencies, what else is affected if timings change, and any relevant historical changes or exceptions.

---

## 5. Significant Changes & Triggers

Only populated where evidence already exists.

- **41.4%** of students report their breakfast behaviour changed at some point this semester (self-reported, retrospective). *(n = 29 — retrospective self-report, Patterns)*
- Written descriptions of *what* changed (where students gave one) are already collected as open-text responses — see the "Written responses" drawer on the Patterns page. Not duplicated here.
- **Mess-side trigger, now documented:** holidays disrupt the mess's forecasting model — students leave campus, so the previous-week same-weekday baseline the team relies on stops holding. *(Mess operations interview, §3a)*
- **Awaiting data:** timetable changes, semester changes, and other administration-side triggers are not yet documented — that requires administration input.

---

## 6. Emerging Feedback & Unintended Consequences

Not a causal-loop diagram yet — administration evidence is still missing and mess evidence only covers one month, so system-level causal relationships can't be fully confirmed. Each observation below separates what's actually evidenced from what's still an open question and what's blocked until the remaining stakeholder data arrives.

### Registered but not reliably used
- **Evidence available:** Plans stay changeable well past the cancellation cutoff, and a large share of registered breakfasts go unused or get redirected to someone else. *(82.8% plan-change; 88.9% unused/redirected)* Mess-side confirmation: **62.9%** of April's registered slots went unused (20,221 of 32,162) — the same pattern, seen from the supply side.
- **Still investigating:** Whether this pattern reflects students routinely over-registering, or the cutoff simply being earlier than plans are usually settled.
- **Now partly answered — mess data available:** Unused/redirected meals do translate into food waste on the mess side (leftover food is thrown away or sent to pig farms), but the mess team's own recording of *how much* is informal — noted down or estimated, not measured. So the loop's existence is confirmed; its exact magnitude in kg/₹ is not.

### Overproduction → wastage → reduced future preparation (new — mess interview)
- **Evidence available:** When turnout is lower than expected, the surplus is wasted; the team's stated response is to prepare less next time, based on that experience. This is a **balancing feedback loop** running on a roughly weekly cadence (same-weekday comparison), but it is asymmetric: when turnout is *higher* than expected, batch-cookable items can be scaled up mid-service, while a *lower*-than-expected turnout has no equivalent mid-service correction — the excess is simply lost.
- **Still investigating:** Because leftover-food recording is informal, the loop's calibration signal is noisy — the team is adjusting next week's quantity based on a remembered/estimated wastage figure, not a logged one. Whether that noise causes systematic over- or under-correction over time is not something this data can answer yet.
- **Also disrupted by:** holidays (§5) breaking the same-weekday baseline the loop depends on, and menu choice (see below) — a popular-dish day can look like "high turnout" even when the underlying registration base is unchanged, potentially miscalibrating the next same-weekday estimate.

### Automatic allocation, limited active choice
- **Evidence available:** A meaningful share of students (34.5%) rely at least partly on automatic mess allocation rather than choosing it themselves.
- **Still investigating:** Whether automatically-allocated students show different attendance patterns than students who actively chose their mess — the current mess export has no per-student identifier, so this can't be cross-tabulated even with the new data (see Mess Attendance page notes).

### Menu choice shapes turnout independently of registration or weekday
- **Evidence available (new — mess interview + Mess Attendance data):** The mess team reports attendance tracks the dish served more than the weekday. The April data shows a real spread by main dish (45.5% down to 25.4% avail rate), consistent with *some* menu effect existing — though the specific dishes the team names as "popular" only partly match what the data shows (§3a): Mysoore Bonda checks out, Wada does not clearly stand out.
- **Still investigating:** Whether the mismatch is because "popularity" is really about something else (e.g. familiarity, day-of-week confounds — most dishes recur on a fixed weekly cycle, see the Mess Attendance page's own caveat about this confound) rather than the dish itself.
- **Blocked — pending more menu cycles:** One month of data means most dishes were only served 1–5 times each; a longer-running menu-attendance join would separate dish effects from novelty or one-off effects.

### Early commitments compete with the breakfast window
- **Evidence available:** Students eat breakfast less often on days with an early class or commitment (32.1%), and "time of first class/meeting" is the single highest-rated structural influence on breakfast decisions (72.4%). Independently, mess swipe-in data shows demand concentrated in a narrow ~08:30–09:20 band inside the wider 7:30–9:30 service window — consistent with students timing breakfast against a first commitment rather than spreading evenly across the window.
- **Still investigating:** Whether shifting or spacing early commitments would measurably change breakfast attendance, versus other factors (sleep, routine) dominating instead.
- **Blocked — pending administration data:** Understanding why early classes are scheduled the way they are, and what constrains changing them, requires administration research, not yet available.

---

## 7. Current Limitations

- Student survey data is cross-sectional, not longitudinal — it supports recurring patterns and relationships, not a tracked behaviour-over-time chart. No such chart is presented, by design.
- Mess operational data now covers **one month (April 2026)** only — long enough to see a real avail-rate spread by dish, too short to separate a dish's true effect from a one-off/novelty effect (most dishes were served 1–5 times).
- The mess export has **no per-student identifier** — it can be shown alongside the student survey for context but never merged or cross-tabulated with it.
- The mess-team interview is a **single source, one round of questions** — not yet triangulated against a second staff perspective or observation data.
- **Leftover-food recording is informal** (noted down or estimated, not measured) — any future waste-volume analysis inherits that imprecision.
- Administration research (scheduling rationale and constraints) is not yet available.
- The feedback-loop observations above are therefore still partial and will be strengthened, not replaced, once administration evidence and more menu cycles arrive.

---

*The student-side figures are generated directly from the same validated computations behind the Events, Patterns, Structures, and Mental Models dashboard pages (via `lib/analytics/activity-5/metrics.ts`) — nothing there is hand-copied or estimated. The mess-side figures (§3) come from the Mess Attendance dashboard (`lib/analytics/mess-attendance`, `lib/analytics/mess-menu`), reading the same April export live rather than a separately maintained copy. The mess-team interview (§3a) is transcribed verbatim, not computed. It's a point-in-time snapshot (n = 29 student responses; April 2026 mess data); regenerate the student-side numbers by rerunning that computation against the latest data if they need updating.*
