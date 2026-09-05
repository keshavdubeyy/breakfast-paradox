import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function InputDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="demo-input-name">Full name</Label>
        <Input
          id="demo-input-name"
          placeholder="Ada Lovelace"
          defaultValue="Ada Lovelace"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="demo-input-email">Email</Label>
        <Input
          id="demo-input-email"
          type="email"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="demo-input-disabled">Workspace URL</Label>
        <Input
          id="demo-input-disabled"
          disabled
          defaultValue="acme-corp.example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="demo-input-invalid">Coupon code</Label>
        <Input
          id="demo-input-invalid"
          aria-invalid="true"
          defaultValue="SAVE10X"
        />
        <p className="text-xs text-destructive">
          This coupon code has expired.
        </p>
      </div>
    </div>
  )
}
