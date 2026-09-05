import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  File01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons"

export default function AttachmentDemo() {
  return (
    <div className="flex flex-col gap-6">
      <AttachmentGroup>
        <Attachment>
          <AttachmentMedia variant="icon">
            <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Q3-inventory.pdf</AttachmentTitle>
            <AttachmentDescription>2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              <span className="sr-only">Remove</span>
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>

        <Attachment>
          <AttachmentMedia variant="icon">
            <HugeiconsIcon icon={Image01Icon} strokeWidth={2} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>display-case.png</AttachmentTitle>
            <AttachmentDescription>1.1 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              <span className="sr-only">Remove</span>
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </AttachmentGroup>

      <Attachment state="error" className="max-w-xs">
        <AttachmentMedia variant="icon">
          <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>invoice.xlsx</AttachmentTitle>
          <AttachmentDescription>Upload failed</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  )
}
