"use client"

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"

export default function QuestionnaireDemo() {
  return (
    <Questionnaire
      defaultItem="favorite-breakfast"
      onSubmit={(event) => event.preventDefault()}
    >
      <QuestionnaireProgress />

      <QuestionnaireItem name="favorite-breakfast" required>
        <QuestionnaireTitle>
          What&apos;s your favorite breakfast?
        </QuestionnaireTitle>
        <QuestionnaireDescription>
          Pick the option you&apos;d order most often.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="pancakes">Pancakes</QuestionnaireChoice>
          <QuestionnaireChoice value="waffles">Waffles</QuestionnaireChoice>
          <QuestionnaireChoice value="omelette">Omelette</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
        <QuestionnaireActions>
          <QuestionnaireSkip />
          <QuestionnaireNext />
        </QuestionnaireActions>
      </QuestionnaireItem>

      <QuestionnaireItem name="toppings" multiple>
        <QuestionnaireTitle>Which toppings do you like?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Select all that apply.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="maple-syrup">
            Maple syrup
          </QuestionnaireChoice>
          <QuestionnaireChoice value="berries">
            Fresh berries
          </QuestionnaireChoice>
          <QuestionnaireChoice value="whipped-cream">
            Whipped cream
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip />
          <QuestionnaireNext />
        </QuestionnaireActions>
      </QuestionnaireItem>

      <QuestionnaireItem name="comments">
        <QuestionnaireTitle>Any other comments?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Optional — tell us anything else.
        </QuestionnaireDescription>
        <QuestionnaireInput placeholder="e.g. Loved the crispy bacon!" />
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSubmit />
        </QuestionnaireActions>
      </QuestionnaireItem>
    </Questionnaire>
  )
}
