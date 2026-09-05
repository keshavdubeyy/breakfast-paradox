"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const slides = [
  "Classic Pancakes",
  "Belgian Waffles",
  "Avocado Toast",
  "Farmhouse Omelette",
  "Berry Parfait",
]

export default function CarouselDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Carousel className="mx-auto w-full max-w-xs">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide}>
              <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border bg-muted p-6 text-center">
                <span className="text-xs text-muted-foreground">
                  Slide {index + 1} of {slides.length}
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {slide}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
