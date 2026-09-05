export default function TypographyDemo() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        The Art of Breakfast
      </h1>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Why mornings matter
      </h2>
      <h3 className="text-xl font-semibold text-foreground">
        Choosing the right ingredients
      </h3>
      <h4 className="text-lg font-medium text-foreground">
        A note on freshness
      </h4>
      <p className="text-xl text-muted-foreground">
        A lead paragraph draws the reader in with a slightly larger, softer
        voice before the body copy settles into its normal rhythm.
      </p>
      <p className="text-base leading-7 text-foreground">
        This is a standard paragraph of body text. It uses comfortable line
        height and a readable measure so that longer passages remain easy to
        scan, whether describing a recipe, a product, or a policy.
      </p>
      <blockquote className="border-l-2 border-border pl-4 text-muted-foreground italic">
        &ldquo;Breakfast is the most important meal of the day, and it deserves
        a typography scale to match.&rdquo;
      </blockquote>
      <ul className="list-disc pl-6 text-base text-foreground">
        <li>Freshly brewed coffee</li>
        <li>Whole grain toast</li>
        <li>Seasonal fruit</li>
      </ul>
      <p className="text-base text-foreground">
        Reference a variable inline with{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
          npm run dev
        </code>{" "}
        to see changes live.
      </p>
      <span className="text-sm text-muted-foreground">
        Last updated September 2026 &middot; internal style reference
      </span>
    </div>
  )
}
