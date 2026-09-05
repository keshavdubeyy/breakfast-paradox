"use client"

import { useState } from "react"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function FieldDemo() {
  const [email, setEmail] = useState("not-an-email")

  return (
    <div className="flex flex-col gap-6">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="demo-field-name">Full name</FieldLabel>
            <Input
              id="demo-field-name"
              placeholder="Ada Lovelace"
              defaultValue="Ada Lovelace"
            />
            <FieldDescription>
              This is the name shown on your public profile.
            </FieldDescription>
          </Field>
          <Field data-invalid={true}>
            <FieldLabel htmlFor="demo-field-email">Email</FieldLabel>
            <Input
              id="demo-field-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid
            />
            <FieldError>Please enter a valid email address.</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
