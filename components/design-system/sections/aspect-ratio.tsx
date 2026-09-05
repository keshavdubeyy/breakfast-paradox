import { AspectRatio } from "@/components/ui/aspect-ratio"

export default function AspectRatioDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="w-full max-w-md">
        <AspectRatio
          ratio={16 / 9}
          className="flex items-center justify-center overflow-hidden rounded-xl border bg-muted"
        >
          <span className="text-sm text-muted-foreground">
            16:9 media placeholder
          </span>
        </AspectRatio>
      </div>

      <div className="w-full max-w-xs">
        <AspectRatio
          ratio={1}
          className="flex items-center justify-center overflow-hidden rounded-xl border bg-muted"
        >
          <span className="text-sm text-muted-foreground">1:1 thumbnail</span>
        </AspectRatio>
      </div>
    </div>
  )
}
