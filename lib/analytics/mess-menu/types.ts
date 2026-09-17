// Kadamba breakfast menu — one row per calendar day for April 2026
// (`data/kadamba-breakfast-menu-april-2026.csv`, sourced from the mess's
// own weekly XLSX/PDF menu sheets). Joined with mess-attendance daily
// totals by date to see which dishes correlate with avail rate — never
// merged with the anonymous student survey.

export interface MenuDayRow {
  /** ISO date (YYYY-MM-DD). */
  date: string
  dayOfWeek: string
  /** The day's main dish. Always present. */
  dish1: string
  /** A second main, only served on some days (the PDF-sourced week has two mains every day). */
  dish2: string | null
  nonVeg: string | null
  /** "XLSX: week N" or "PDF: <date range>" — the sheet this row was read from. */
  source: string
}
