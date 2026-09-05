import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export default function NativeSelectDemo() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Plan</span>
        <NativeSelect defaultValue="pro">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="starter">Starter</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
          <NativeSelectOption value="business">Business</NativeSelectOption>
          <NativeSelectOption value="enterprise">Enterprise</NativeSelectOption>
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Size: sm
        </span>
        <NativeSelect size="sm" defaultValue="us">
          <NativeSelectOption value="us">United States</NativeSelectOption>
          <NativeSelectOption value="ca">Canada</NativeSelectOption>
          <NativeSelectOption value="uk">United Kingdom</NativeSelectOption>
          <NativeSelectOption value="au">Australia</NativeSelectOption>
          <NativeSelectOption value="in">India</NativeSelectOption>
          <NativeSelectOption value="jp">Japan</NativeSelectOption>
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Disabled
        </span>
        <NativeSelect disabled defaultValue="locked">
          <NativeSelectOption value="locked">Locked plan</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  )
}
