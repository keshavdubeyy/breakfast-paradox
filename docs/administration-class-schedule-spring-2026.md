# Administration data — Spring 2026 class schedule (source doc)

This is the source transcription behind the `class_schedule` rows actually
loaded by [supabase/migrations/20260917010000_class_schedule_spring_2026_seed.sql](../supabase/migrations/20260917010000_class_schedule_spring_2026_seed.sql)
(read by [lib/analytics/administration/fetch.ts](../lib/analytics/administration/fetch.ts)
and shown on the `/admin/administration` page). It is transcribed directly
from the institute's Spring 2026 lecture timetable PDF (**Ver 3: 31-12-2025**),
with day groups collapsed (Monday+Thursday both run group A's schedule, etc.)
so each course-slot appears once with its full meeting-day set, matching how
`class_schedule.days` is stored (e.g. `{"Mon","Thu"}`).

**Semester label used for `class_schedule.semester`:** `Spring 2026`. The
seed migration also deletes the earlier `Monsoon 2026` rows that had been
imported directly into the table, so this replaces that data rather than
sitting alongside it.

## Fields not in this document — still not filled in

`course_no`, `registered_count`, and `faculty_names` are loaded as
`NULL`/empty for every row: the timetable PDF simply doesn't contain them.
The schema (`supabase/migrations/20260917000000_class_schedule_timetable_columns.sql`)
was changed to allow `course_no` and `registered_count` to be null, rather
than fabricating values, per the "never fabricate this" rule in `fetch.ts`.
Fill these in from the registration-portal export when it becomes available —
either a follow-up migration or a manual update keyed on `course_name` +
`slot_code`.

- **`course_no`** — course code (e.g. "CS100"). Not printed on the timetable.
- **`registered_count`** — seat count per course. Not printed on the timetable.
- **`faculty_names`** — instructor(s). Not printed on the timetable.

## Fields this document has that now have a column

`room` and `tag` (the H1/H2/H tutorial-group marker) are now real columns
on `class_schedule`, added alongside this import, and are populated below.
Section labels (e.g. "Sec A/B/C" within a course name) are left folded into
`course_name` as printed on the timetable rather than split into their own
column — nothing asked for that split.

**`slot_code`** below is the day-group letter + the timetable's own slot
number, e.g. `A1` for Monday/Thursday's 8:30–9:55 AM slot, `B1` for
Tuesday/Friday's, `C1` for Wednesday/Saturday's — kept as the institute's own
scheduling unit per the column's comment.

### Standard time slots

| Slot | Time | 24h start–end |
| --- | --- | --- |
| 1 | 8:30–9:55 AM | 08:30–09:55 |
| 2 | 10:05–11:30 AM | 10:05–11:30 |
| 3 | 11:40 AM–1:05 PM | 11:40–13:05 |
| Lunch | 1:00–2:00 PM | 13:00–14:00 |
| 4 | 2:00–3:25 PM | 14:00–15:25 |
| 5 | 3:35–5:00 PM | 15:35–17:00 |
| 6 | 5:10–6:40 PM | 17:10–18:40 |

---

## Group A — Monday & Thursday

### Slot A1 · 08:30–09:55 · Mon, Thu

| Course Name | Tag | Room |
| --- | --- | --- |
| The Mathematics of Information: Theory & Application | H1 | H101 |
| Introduction to Coding Theory | H2 | H101 |
| Optimization Methods | | H103 |
| Making of Contemporary World | | H201 |
| CMOS Oscillator Design | | H301 |
| Advanced Structural Analysis | | H302 |
| Computer Systems Organization (Section A&B) | | SH1 & SH2 |

### Slot A2 · 10:05–11:30 · Mon, Thu

| Course Name | Tag | Room |
| --- | --- | --- |
| General and Structural Chemistry | | H101 |
| Introduction to Linguistics II | | H102 |
| Mathematical Models in Biology | | H103 |
| Design and Analysis of Software Systems | | H105 |
| Molecular Biology | | H201 |
| Machine Learning for Natural Sciences | | H202 |
| Earthquake Engineering | | H203 |
| Introduction to IoT | | H205 |
| Physics of Soft Condensed Matter | | H301 |
| Introduction to Particle Physics | | H302 |
| Analog Electronic Circuits | | SH2 |
| Communication Theory | | SH3 |

### Slot A3 · 11:40–13:05 · Mon, Thu

| Course Name | Tag | Room |
| --- | --- | --- |
| Computing in Sciences II | H2 | H101 |
| Introduction to Spatial Sciences & Technology | H2 | H102 |
| Advanced Algorithms | | H103 |
| Topics in Reinforcement Learning | | H104 |
| Behavioral Research: Statistical Methods | | H105 |
| Organic Chemistry | H2 | H201 |
| User Interaction and Usability of Digital Products | | H203 |
| Responsible & Safe AI Systems | | H204 |
| Intro to Human Sciences (UG2 ECE/D, CLD, CGD & UG3 CND) (Sec A) | | H205 |
| Foundations for Trustworthy Parallel Computing | H2 | H301 |
| Speech Signal Processing | | H302 |
| Information & Communication | | SH2 |

### Slot A4 · 14:00–15:25 · Mon, Thu

| Course Name | Tag | Room |
| --- | --- | --- |
| Basics of Ethics | H1/H2 | H101 |
| Differential Equations | | H102 |
| Learning and Memory | | H103 |
| Thermodynamics | H1 | H104 |
| Intro to Human Sciences (UG2 CSE/D) (Sec B) | | H105 |
| Art, Vision, & Feelings | H2 | H201 |
| Computational Psycholinguistics | | H202 |
| Topics in Discrete Mathematics | | H203 |
| Science II (UG3 ECE/D, LED & CHD) (Sec B) | | H205 |
| Disaster Management | | H301 |
| Linear Partial Differential Equations and Variational Calculus | | H302 |
| Intro to Processor Architecture | H1 | SH2 |

### Slot A5 · 15:35–17:00 · Mon, Thu

| Course Name | Tag | Room |
| --- | --- | --- |
| Applications of Language Models | | H101 |
| Robotics: Planning and Navigation | | H102 |
| Introduction to Information Security | H1 | H103 |
| Digital Signal Analysis | H2 | H103 |
| Statistical Methods in AI | | H105 |
| Law, Technology and Digital Governance | | H201 |
| Flexible Electronics | | H202 |

### Slot A6 · 17:10–18:40 · Mon, Thu

| Course Name | Tag | Room |
| --- | --- | --- |
| Critical Viewing and Reading | | H101 |
| Growth and Development | | H103 |

---

## Group B — Tuesday & Friday

### Slot B1 · 08:30–09:55 · Tue, Fri

| Course Name | Tag | Room |
| --- | --- | --- |
| Introduction to Quantum Information and Computation | H1 | H101 |
| Introduction to Algorithms Engineering | H2 | H101 |
| Research Methods in Human Sciences | | H102 |
| Intro to VLSI and Embedded Systems | H1 | H103 |
| Introduction to Statistical Signal Processing | H2 | H103 |
| Topics in Physics | | H201 |
| Mathematical Methods in Sciences | | H202 |
| The Universe Across Scales | | H205 |
| Molecular Modeling and Simulations | | H301 |
| Product Lifecycle Management | | H302 |
| Data Structures and Algorithms (Section A, B&C) | | SH1, SH2 & SH3 |

### Slot B2 · 10:05–11:30 · Tue, Fri (with one exception — see note)

| Course Name | Tag | Room | Days |
| --- | --- | --- | --- |
| Engineering Virtual Reality Systems | H | H101 | **Tue only** — not listed for Friday in the source PDF |
| Performance Modeling of Computer Systems | H1 | H102 | Tue, Fri |
| Statistical Mechanics | H2 | H102 | Tue, Fri |
| Biomolecular Structures | H1 | H103 | Tue, Fri |
| Introduction to Brain and Cognition | H2 | H103 | Tue, Fri |
| Introduction to Game Theory | | H104 | Tue, Fri |
| Data Systems | | H105 | Tue, Fri |
| Computational Linguistics 1 | | H201 | Tue, Fri |
| Spatial Data Sciences | | H202 | Tue, Fri |
| Quantum Algorithms | | H203 | Tue, Fri |
| Analog IC Design | | H204 | Tue, Fri |
| Science, Technology and Society | | H301 | Tue, Fri |
| TKHS-I | | H302 | Tue, Fri |
| Cognitive Neuroscience | | H303 | Tue, Fri |
| Computing Tools | | H304 | Tue, Fri |
| Instrumentation and Devices | | B4-302 | Tue, Fri |
| Classical Mechanics | H1 | CR1 | Tue, Fri |
| Electrodynamics | H2 | CR1 | Tue, Fri |

### Slot B3 · 11:40–13:05 · Tue, Fri

| Course Name | Tag | Room |
| --- | --- | --- |
| Language Typology and Universals | | H101 |
| Linguistic Data 3: Data Modeling in ILs | H1 | H102 |
| Numerical Algorithms | H1 | H103 |
| Language and Power | H1 | H104 |
| Geospatial for Sustainable Development | | H201 |
| Ethics and the Digital Society | H1 | H203 |
| Evaluation Methods for NLP | H2 | H203 |
| AI and Human Rights | H1 | H204 |
| Literature and the Ethics of telling a Story | H2 | H204 |
| Analysis and Design of Bridge Infrastructure | | H301 |
| Ethics in Research | H2 | H303 |
| Constitutional Ethics | H2 | H304 |
| Linear Algebra (Section A, B&C) | | SH1, SH2 & SH3 |

### Slot B4 · 14:00–15:25 · Tue, Fri

| Course Name | Tag | Room |
| --- | --- | --- |
| Information-Theoretic Methods in Computer Science | | H101 |
| Cognitive Science and AI | | H102 |
| Compilers | | H103 |
| Hydro Informatics & Climate Sciences | | H104 |
| Science II (UG2 CSE/D, UG3 CLD) (Sec A) | | H105 |
| Mathematics for Finance | | H201 |
| Technology Product Entrepreneurship | | H202 |
| Intro to Robotics: Perception and Planning | H1 | H203 |
| Foundations of RF and Microwave Sensors | H2 | H203 |
| Optical Remote Sensing | | H204 |
| Distributed Systems | | H205 |
| Topics in SSMT | | H301 |
| Machine Learning for Communication | | H302 |
| NGS Data Analysis | | H303 |
| Analysis & Design of Precast and Prestressed Structures | | H304 |

### Slot B5 · 15:35–17:00 · Tue, Fri

| Course Name | Tag | Room |
| --- | --- | --- |
| Readings in Russian Literature | | H101 |
| The Digital City | | H102 |
| Software Programming for Performance | H1 | H103 |
| Introduction to Philosophy of Technology | | H104 |
| Data Visualisation | H1 | H105 |
| Sustainable Growth Strategy for Startup | H1 | H201 |
| Knowing India Through Data | H2 | H201 |
| Theories and Practices of Nationalism | | H202 |
| System and Network Security | | H205 |
| Music Language Creativity | | N328 |

### Slot B6 · 17:10–18:40 · Tue, Fri

| Course Name | Tag | Room |
| --- | --- | --- |
| Internals of Application Servers | | H101 |
| Intro to UAV Design | | H103 |
| Principles of Information Security | | H105 |
| Software Engineering | | H205 |

---

## Group C — Wednesday & Saturday

### Slot C1 · 08:30–09:55 · Wed, Sat

| Course Name | Tag | Room |
| --- | --- | --- |
| Computer Graphics | H2 | H101 |
| Quantum aspects of Cryptography | | H102 |
| Information Security Audit and Assurance | | H103 |
| Molecular Symmetry and Quantum Mechanics | | H104 |
| Introduction to NLP | | H105 |
| Introduction to Software Systems (Section A&B) | H | SH1 & SH2 |

### Slot C2 · 10:05–11:30 · Wed, Sat

| Course Name | Tag | Room |
| --- | --- | --- |
| Sociology of Platform Economies | | H101 |
| Digital Democracy and Data Governance in the European Union | | H102 |
| Mechatronics System Design | | H103 |
| Machine, Data and Learning | | H105 |
| Gender, Culture and Representation | | H201 |
| Product Design Workshop | | H202 |
| Computer Vision | | H205 |
| Arts-2 | H1&H2 | Nilgiri Classrooms |

### Wednesday tutorial slots — 11:40–12:40 and 12:40–13:40

| Course Name | Tag |
| --- | --- |
| Value Education-II | H |

Two tutorial sub-slots on Wednesday only (not mirrored on Saturday, which
instead has its own tutorial block — see below). Not one of the six standard
slots, so it doesn't get an `A/B/C` + number `slot_code`; use the raw times
(`11:40–12:40`, `12:40–13:40`) if importing as separate rows.

### Wednesday afternoon

Marked on the source timetable as **"Free Slot / FSIS"** — no scheduled
courses.

### Saturday tutorial slots — 11:40–12:40 and 12:40–13:40

Same two tutorial sub-slots as Wednesday, but the source PDF does not repeat
the "Value Education-II" entry under Saturday — it's shown blank/generic
("Tutorial Slot") with no course name.

### Saturday special afternoon — 14:00–17:00

| Course Name | Room |
| --- | --- |
| Business Finance | H103 |

This runs as a single 3-hour block (2:00–5:00 PM), not the normal Slot 4 /
Slot 5 split — kept as one row rather than force-split into two slots.

### Saturday, remaining afternoon

Marked **"Free Slot"** — no scheduled courses.

---

## Source notes (carried over, not dashboard data)

- Version: **Ver 3: 31-12-2025**
- Document ends with **"Sd/- Dean (Academics)"**.
- Monday and Thursday share group A's schedule; Tuesday and Friday share
  group B's; Wednesday and Saturday share group C's — each course above is
  listed once per slot with both of that group's days, not duplicated as two
  rows.
