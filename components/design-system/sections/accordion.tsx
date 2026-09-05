"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    value: "billing",
    question: "How does billing work?",
    answer:
      "You're billed monthly based on the plan you choose. Upgrades take effect immediately and downgrades apply at the start of your next billing cycle.",
  },
  {
    value: "cancel",
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel from your account settings at any time. You'll keep access to your plan until the end of the current billing period.",
  },
  {
    value: "data",
    question: "What happens to my data if I downgrade?",
    answer:
      "Your data is never deleted on a downgrade. Some features may become read-only until you're back on a plan that supports them.",
  },
]

export default function AccordionDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Accordion defaultValue={["billing"]}>
        {faqs.map((faq) => (
          <AccordionItem key={faq.value} value={faq.value}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
