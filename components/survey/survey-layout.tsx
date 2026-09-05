import type { ReactNode } from "react"

import { ProgressiveBlur } from "@/components/ui/progressive-blur"

interface SurveyLayoutProps {
  /** 0-100. Renders a thin progress bar pinned to the very top of the viewport. */
  progress?: number
  /** Optional header content, shown above the main content. */
  header?: ReactNode
  /** Main screen content (title, copy, form controls). */
  children: ReactNode
  /** Bottom action area — primary CTA and any secondary actions. */
  footer?: ReactNode
}

/**
 * Shared page shell for every survey screen: a single centered column that
 * stays comfortable on mobile and never stretches too wide on larger
 * screens.
 */
function SurveyLayout({ progress, header, children, footer }: SurveyLayoutProps) {
  return (
    <div className="min-h-svh bg-background">
      {typeof progress === "number" ? (
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="fixed inset-x-0 top-0 z-20 h-1 bg-muted"
        >
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {footer ? (
        // Independent, full-bleed scroll-fade layer — fixed to the
        // viewport, not the padded content column, and not nested in or
        // offset from the footer below it.
        <ProgressiveBlur
          position="bottom"
          height="8rem"
          className="fixed inset-x-0 bottom-0 z-10"
        />
      ) : null}

      <div className="mx-auto flex min-h-svh w-full max-w-[680px] flex-col px-6 sm:px-8">
        {header ? <header className="pt-6 sm:pt-10">{header}</header> : null}

        <main className="flex flex-1 flex-col justify-center py-10">
          {children}
        </main>

        {footer ? (
          // Independent sticky action bar — no background of its own, so
          // only the blur layer above provides the visual separation.
          <footer className="sticky bottom-0 z-20 flex flex-col gap-4 pt-4 pb-8 sm:pb-10">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}

export { SurveyLayout }
