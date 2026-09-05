import { Badge } from "@/components/ui/badge"

import AccordionDemo from "@/components/design-system/sections/accordion"
import AlertDemo from "@/components/design-system/sections/alert"
import AlertDialogDemo from "@/components/design-system/sections/alert-dialog"
import AspectRatioDemo from "@/components/design-system/sections/aspect-ratio"
import AttachmentDemo from "@/components/design-system/sections/attachment"
import AvatarDemo from "@/components/design-system/sections/avatar"
import BadgeDemo from "@/components/design-system/sections/badge"
import BreadcrumbDemo from "@/components/design-system/sections/breadcrumb"
import BubbleDemo from "@/components/design-system/sections/bubble"
import ButtonDemo from "@/components/design-system/sections/button"
import ButtonGroupDemo from "@/components/design-system/sections/button-group"
import CalendarDemo from "@/components/design-system/sections/calendar"
import CardDemo from "@/components/design-system/sections/card"
import CarouselDemo from "@/components/design-system/sections/carousel"
import ChartDemo from "@/components/design-system/sections/chart"
import CheckboxDemo from "@/components/design-system/sections/checkbox"
import CollapsibleDemo from "@/components/design-system/sections/collapsible"
import ComboboxDemo from "@/components/design-system/sections/combobox"
import CommandDemo from "@/components/design-system/sections/command"
import ContextMenuDemo from "@/components/design-system/sections/context-menu"
import DataTableDemo from "@/components/design-system/sections/data-table"
import DatePickerDemo from "@/components/design-system/sections/date-picker"
import DialogDemo from "@/components/design-system/sections/dialog"
import DirectionDemo from "@/components/design-system/sections/direction"
import DrawerDemo from "@/components/design-system/sections/drawer"
import DropdownMenuDemo from "@/components/design-system/sections/dropdown-menu"
import EmptyDemo from "@/components/design-system/sections/empty"
import FieldDemo from "@/components/design-system/sections/field"
import HoverCardDemo from "@/components/design-system/sections/hover-card"
import InputDemo from "@/components/design-system/sections/input"
import InputGroupDemo from "@/components/design-system/sections/input-group"
import InputOTPDemo from "@/components/design-system/sections/input-otp"
import ItemDemo from "@/components/design-system/sections/item"
import KbdDemo from "@/components/design-system/sections/kbd"
import LabelDemo from "@/components/design-system/sections/label"
import MarkerDemo from "@/components/design-system/sections/marker"
import MenubarDemo from "@/components/design-system/sections/menubar"
import MessageDemo from "@/components/design-system/sections/message"
import MessageScrollerDemo from "@/components/design-system/sections/message-scroller"
import NativeSelectDemo from "@/components/design-system/sections/native-select"
import NavigationMenuDemo from "@/components/design-system/sections/navigation-menu"
import PaginationDemo from "@/components/design-system/sections/pagination"
import PopoverDemo from "@/components/design-system/sections/popover"
import ProgressDemo from "@/components/design-system/sections/progress"
import QuestionnaireDemo from "@/components/design-system/sections/questionnaire"
import RadioGroupDemo from "@/components/design-system/sections/radio-group"
import ResizableDemo from "@/components/design-system/sections/resizable"
import ScrollAreaDemo from "@/components/design-system/sections/scroll-area"
import SelectDemo from "@/components/design-system/sections/select"
import SeparatorDemo from "@/components/design-system/sections/separator"
import SheetDemo from "@/components/design-system/sections/sheet"
import SidebarDemo from "@/components/design-system/sections/sidebar"
import SkeletonDemo from "@/components/design-system/sections/skeleton"
import SliderDemo from "@/components/design-system/sections/slider"
import SpinnerDemo from "@/components/design-system/sections/spinner"
import SwitchDemo from "@/components/design-system/sections/switch"
import TableDemo from "@/components/design-system/sections/table"
import TabsDemo from "@/components/design-system/sections/tabs"
import TextareaDemo from "@/components/design-system/sections/textarea"
import ToastDemo from "@/components/design-system/sections/toast"
import ToggleDemo from "@/components/design-system/sections/toggle"
import ToggleGroupDemo from "@/components/design-system/sections/toggle-group"
import TooltipDemo from "@/components/design-system/sections/tooltip"
import TypographyDemo from "@/components/design-system/sections/typography"

type ComponentEntry = {
  id: string
  name: string
  isNew?: boolean
  Demo: React.ComponentType
}

const components: ComponentEntry[] = [
  { id: "accordion", name: "Accordion", Demo: AccordionDemo },
  { id: "alert", name: "Alert", Demo: AlertDemo },
  { id: "alert-dialog", name: "Alert Dialog", Demo: AlertDialogDemo },
  { id: "aspect-ratio", name: "Aspect Ratio", Demo: AspectRatioDemo },
  { id: "attachment", name: "Attachment", Demo: AttachmentDemo },
  { id: "avatar", name: "Avatar", Demo: AvatarDemo },
  { id: "badge", name: "Badge", Demo: BadgeDemo },
  { id: "breadcrumb", name: "Breadcrumb", Demo: BreadcrumbDemo },
  { id: "bubble", name: "Bubble", Demo: BubbleDemo },
  { id: "button", name: "Button", Demo: ButtonDemo },
  { id: "button-group", name: "Button Group", Demo: ButtonGroupDemo },
  { id: "calendar", name: "Calendar", Demo: CalendarDemo },
  { id: "card", name: "Card", Demo: CardDemo },
  { id: "carousel", name: "Carousel", Demo: CarouselDemo },
  { id: "chart", name: "Chart", Demo: ChartDemo },
  { id: "checkbox", name: "Checkbox", Demo: CheckboxDemo },
  { id: "collapsible", name: "Collapsible", Demo: CollapsibleDemo },
  { id: "combobox", name: "Combobox", Demo: ComboboxDemo },
  { id: "command", name: "Command", Demo: CommandDemo },
  { id: "context-menu", name: "Context Menu", Demo: ContextMenuDemo },
  { id: "data-table", name: "Data Table", Demo: DataTableDemo },
  { id: "date-picker", name: "Date Picker", Demo: DatePickerDemo },
  { id: "dialog", name: "Dialog", Demo: DialogDemo },
  { id: "direction", name: "Direction", Demo: DirectionDemo },
  { id: "drawer", name: "Drawer", Demo: DrawerDemo },
  { id: "dropdown-menu", name: "Dropdown Menu", Demo: DropdownMenuDemo },
  { id: "empty", name: "Empty", Demo: EmptyDemo },
  { id: "field", name: "Field", Demo: FieldDemo },
  { id: "hover-card", name: "Hover Card", Demo: HoverCardDemo },
  { id: "input", name: "Input", Demo: InputDemo },
  { id: "input-group", name: "Input Group", Demo: InputGroupDemo },
  { id: "input-otp", name: "Input OTP", Demo: InputOTPDemo },
  { id: "item", name: "Item", Demo: ItemDemo },
  { id: "kbd", name: "Kbd", Demo: KbdDemo },
  { id: "label", name: "Label", Demo: LabelDemo },
  { id: "marker", name: "Marker", Demo: MarkerDemo },
  { id: "menubar", name: "Menubar", Demo: MenubarDemo },
  { id: "message", name: "Message", Demo: MessageDemo },
  {
    id: "message-scroller",
    name: "Message Scroller",
    Demo: MessageScrollerDemo,
  },
  { id: "native-select", name: "Native Select", Demo: NativeSelectDemo },
  { id: "navigation-menu", name: "Navigation Menu", Demo: NavigationMenuDemo },
  { id: "pagination", name: "Pagination", Demo: PaginationDemo },
  { id: "popover", name: "Popover", Demo: PopoverDemo },
  { id: "progress", name: "Progress", Demo: ProgressDemo },
  {
    id: "questionnaire",
    name: "Questionnaire",
    isNew: true,
    Demo: QuestionnaireDemo,
  },
  { id: "radio-group", name: "Radio Group", Demo: RadioGroupDemo },
  { id: "resizable", name: "Resizable", Demo: ResizableDemo },
  { id: "scroll-area", name: "Scroll Area", Demo: ScrollAreaDemo },
  { id: "select", name: "Select", Demo: SelectDemo },
  { id: "separator", name: "Separator", Demo: SeparatorDemo },
  { id: "sheet", name: "Sheet", Demo: SheetDemo },
  { id: "sidebar", name: "Sidebar", Demo: SidebarDemo },
  { id: "skeleton", name: "Skeleton", Demo: SkeletonDemo },
  { id: "slider", name: "Slider", Demo: SliderDemo },
  { id: "spinner", name: "Spinner", Demo: SpinnerDemo },
  { id: "switch", name: "Switch", Demo: SwitchDemo },
  { id: "table", name: "Table", Demo: TableDemo },
  { id: "tabs", name: "Tabs", Demo: TabsDemo },
  { id: "textarea", name: "Textarea", Demo: TextareaDemo },
  { id: "toast", name: "Toast", Demo: ToastDemo },
  { id: "toggle", name: "Toggle", Demo: ToggleDemo },
  { id: "toggle-group", name: "Toggle Group", Demo: ToggleGroupDemo },
  { id: "tooltip", name: "Tooltip", Demo: TooltipDemo },
  { id: "typography", name: "Typography", Demo: TypographyDemo },
]

export default function DesignSystemPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:gap-12 lg:px-8">
      <aside className="shrink-0 lg:w-56">
        <div className="lg:sticky lg:top-10">
          <h2 className="text-sm font-semibold text-foreground">
            On this page
          </h2>
          <nav className="mt-3 max-h-[calc(100svh-8rem)] overflow-y-auto pr-2 lg:max-h-[calc(100svh-6rem)]">
            <ul className="flex flex-col gap-1 text-sm">
              {components.map((component) => (
                <li key={component.id}>
                  <a
                    href={`#${component.id}`}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {component.name}
                    {component.isNew && (
                      <Badge
                        variant="secondary"
                        className="h-4 px-1.5 text-[10px]"
                      >
                        New
                      </Badge>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 border-b border-border pb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Components
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Design System
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every component available in the library, with a working example of
            each. Press <kbd>d</kbd> to toggle dark mode.
          </p>
        </div>

        <div className="flex flex-col">
          {components.map((component, index) => {
            const Demo = component.Demo
            return (
              <section
                key={component.id}
                id={component.id}
                className={`scroll-mt-10 py-10 ${
                  index !== components.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <div className="mb-6 flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {component.name}
                  </h2>
                  {component.isNew && <Badge className="h-5">New</Badge>}
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <Demo />
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
