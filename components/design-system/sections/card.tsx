import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CardDemo() {
  return (
    <div className="flex flex-wrap gap-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Growth plan</CardTitle>
          <CardDescription>
            For restaurants running multiple locations.
          </CardDescription>
          <CardAction>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Active
            </span>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-foreground">
            $79
            <span className="text-sm font-normal text-muted-foreground">
              /mo
            </span>
          </p>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
            <li>Up to 5 locations</li>
            <li>Unlimited online orders</li>
            <li>Priority support</li>
          </ul>
        </CardContent>
        <CardFooter className="gap-2 border-t">
          <Button variant="outline" className="flex-1">
            Manage plan
          </Button>
          <Button className="flex-1">Upgrade</Button>
        </CardFooter>
      </Card>

      <Card size="sm" className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Today&apos;s summary</CardTitle>
          <CardDescription>Breakfast Paradox &mdash; Main St</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Orders</p>
              <p className="text-lg font-semibold text-foreground">128</p>
            </div>
            <div>
              <p className="text-muted-foreground">Revenue</p>
              <p className="text-lg font-semibold text-foreground">$1,940</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">
            View full report
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
