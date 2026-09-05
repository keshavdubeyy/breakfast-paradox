export interface ProgramOption {
  value: string
  label: string
}

export const OTHER_PROGRAM_VALUE = "other"

/**
 * Temporary placeholder program list. Replace with the institution's actual
 * program catalogue when it's available — nothing else in the UI depends on
 * these specific values.
 */
export const PROGRAM_OPTIONS: ProgramOption[] = [
  { value: "btech-cse", label: "B.Tech — Computer Science & Engineering" },
  { value: "btech-ece", label: "B.Tech — Electronics & Communication Engineering" },
  { value: "btech-mech", label: "B.Tech — Mechanical Engineering" },
  { value: "btech-civil", label: "B.Tech — Civil Engineering" },
  { value: "btech-eee", label: "B.Tech — Electrical & Electronics Engineering" },
  { value: "bdes", label: "B.Des — Design" },
  { value: "bba", label: "BBA" },
  { value: "mtech", label: "M.Tech" },
  { value: "mba", label: "MBA" },
  { value: "phd", label: "PhD" },
  { value: OTHER_PROGRAM_VALUE, label: "Other" },
]
