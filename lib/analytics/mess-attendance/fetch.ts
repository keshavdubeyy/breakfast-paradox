import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"

import type { MessAttendanceRow, MessName } from "./types"

const CSV_PATH = path.join(process.cwd(), "data", "april-data-clean.csv")
const KNOWN_MESSES: readonly MessName[] = ["kadamba-veg", "kadamba-nonveg"]

function parseRow(fields: string[], lineNumber: number): MessAttendanceRow {
  const [
    mealDate,
    mealMess,
    availedAt,
    availed,
    dayOfWeek,
    isWeekend,
    availedTimeIst,
    availedHourIst,
  ] = fields

  if (!KNOWN_MESSES.includes(mealMess as MessName)) {
    throw new Error(`Unrecognized meal_mess "${mealMess}" on line ${lineNumber}`)
  }

  return {
    mealDate,
    mealMess: mealMess as MessName,
    availedAt: availedAt === "" ? null : availedAt,
    availed: availed === "True",
    dayOfWeek,
    isWeekend: isWeekend === "True",
    availedTimeIst: availedTimeIst === "" ? null : availedTimeIst,
    availedHourIst: availedHourIst === "" ? null : Number(availedHourIst),
  }
}

/** The CSV is our own cleaned export (`scripts/clean_april_data.py`) — no
 * quoted/escaped fields, so a plain comma split is safe and avoids
 * pulling in a CSV dependency for one static file. */
function parseCsv(text: string): MessAttendanceRow[] {
  const lines = text.split("\n").filter((line) => line.length > 0)
  const [, ...dataLines] = lines // drop the header row
  return dataLines.map((line, index) => parseRow(line.split(","), index + 2))
}

export interface MessAttendanceFetchResult {
  rows: MessAttendanceRow[]
  /** false when the cleaned CSV isn't present — never fabricate this
   * dataset, so an unavailable file just shows nothing. */
  isConfigured: boolean
}

/** Reads the cleaned April mess-attendance export from disk. This is a
 * static, one-off dataset (not a live Supabase table) — re-running
 * `scripts/clean_april_data.py` on a newer export and redeploying is how
 * this gets updated. */
export async function fetchMessAttendance(): Promise<MessAttendanceFetchResult> {
  let text: string
  try {
    text = await readFile(CSV_PATH, "utf-8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { rows: [], isConfigured: false }
    }
    throw error
  }

  return { rows: parseCsv(text), isConfigured: true }
}
