import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"

import type { MenuDayRow } from "./types"

const CSV_PATH = path.join(process.cwd(), "data", "kadamba-breakfast-menu-april-2026.csv")

const COLUMNS = [
  "date",
  "dayOfWeek",
  "dish1",
  "dish2",
  "lentilSoup",
  "chutney1",
  "chutney2",
  "cereals",
  "breadButterJam",
  "accompaniment",
  "sprouts",
  "dairy1",
  "dairy2",
  "fruit",
  "nonVeg",
  "source",
] as const

/** A couple of fields (e.g. "Bread, Butter Jam") contain commas inside
 * quotes, so a plain split(",") isn't safe here. */
function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      fields.push(current)
      current = ""
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

function parseRow(fields: string[]): MenuDayRow {
  const record = Object.fromEntries(COLUMNS.map((key, index) => [key, fields[index] ?? ""]))
  return {
    date: record.date,
    dayOfWeek: record.dayOfWeek,
    dish1: record.dish1,
    dish2: record.dish2 === "" ? null : record.dish2,
    nonVeg: record.nonVeg === "" ? null : record.nonVeg,
    source: record.source,
  }
}

function parseCsv(text: string): MenuDayRow[] {
  const withoutBom = text.replace(/^﻿/, "")
  const lines = withoutBom.split(/\r\n|\n/).filter((line) => line.length > 0)
  const [, ...dataLines] = lines // drop the header row
  return dataLines.map((line) => parseRow(parseCsvLine(line)))
}

export interface MessMenuFetchResult {
  rows: MenuDayRow[]
  /** false when the menu CSV isn't present — never fabricate this
   * dataset, so an unavailable file just hides the menu section. */
  isConfigured: boolean
}

/** Reads the April Kadamba breakfast menu from disk. Static, hand-compiled
 * from the mess's weekly XLSX/PDF sheets — not a live table. */
export async function fetchMessMenu(): Promise<MessMenuFetchResult> {
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
